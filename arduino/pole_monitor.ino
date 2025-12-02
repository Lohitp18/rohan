/*
 * ZAPSAFE - GRIDWATCH Arduino Code
 * Utility Pole Monitoring System
 * 
 * This code reads voltage, current, and GPS data from sensors
 * and sends it to the server via HTTP POST request
 * 
 * Required Libraries:
 * - WiFi (ESP32) or Ethernet (Arduino with Ethernet Shield)
 * - HTTPClient (ESP32) or EthernetClient
 * - TinyGPS++ (for GPS module)
 * - ArduinoJson (for JSON formatting)
 * 
 * Hardware Connections:
 * - Voltage Sensor: Analog pin A0
 * - Current Sensor (ACS712): Analog pin A1
 * - GPS Module: Serial pins (RX/TX)
 */

// Uncomment the board you're using:
// #define ESP32_BOARD
// #define ARDUINO_ETHERNET

#ifdef ESP32_BOARD
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://YOUR_SERVER_IP:3000/api/poles/sensor-data";
#endif

#ifdef ARDUINO_ETHERNET
#include <Ethernet.h>
#include <ArduinoJson.h>

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress server(192, 168, 1, 100); // Change to your server IP
EthernetClient client;
#endif

// Sensor pins
const int VOLTAGE_PIN = A0;
const int CURRENT_PIN = A1;

// GPS variables (if using GPS module)
float gpsLat = 0.0;
float gpsLon = 0.0;
bool gpsValid = false;

// Pole ID - Change this for each pole
String POLE_ID = "POLE001";

// Timing
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 5000; // Send data every 5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("ZAPSAFE - GRIDWATCH Arduino Monitor");
  Serial.println("Initializing...");
  
  #ifdef ESP32_BOARD
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  #endif
  
  #ifdef ARDUINO_ETHERNET
  // Initialize Ethernet
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Try with static IP
    IPAddress ip(192, 168, 1, 177);
    IPAddress gateway(192, 168, 1, 1);
    IPAddress subnet(255, 255, 255, 0);
    Ethernet.begin(mac, ip, gateway, subnet);
  }
  Serial.print("Ethernet connected! IP: ");
  Serial.println(Ethernet.localIP());
  #endif
  
  // Initialize sensor pins
  pinMode(VOLTAGE_PIN, INPUT);
  pinMode(CURRENT_PIN, INPUT);
  
  Serial.println("System ready!");
  Serial.print("Monitoring Pole ID: ");
  Serial.println(POLE_ID);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors
  float voltage = readVoltage();
  float current = readCurrent();
  
  // Read GPS (if available)
  // readGPS(); // Uncomment if GPS module is connected
  
  // Send data to server at intervals
  if (currentTime - lastUpdate >= UPDATE_INTERVAL) {
    sendSensorData(voltage, current);
    lastUpdate = currentTime;
  }
  
  delay(100); // Small delay for stability
}

float readVoltage() {
  // Read analog voltage (0-5V mapped to 0-1023 for Arduino, 0-4095 for ESP32)
  int sensorValue = analogRead(VOLTAGE_PIN);
  
  #ifdef ESP32_BOARD
  // ESP32 ADC: 0-3.3V, 12-bit (0-4095)
  float voltage = (sensorValue / 4095.0) * 3.3 * 2.0; // Adjust multiplier based on voltage divider
  #else
  // Arduino ADC: 0-5V, 10-bit (0-1023)
  float voltage = (sensorValue / 1023.0) * 5.0 * 2.0; // Adjust multiplier based on voltage divider
  #endif
  
  return voltage;
}

float readCurrent() {
  // Read current from ACS712 or similar current sensor
  int sensorValue = analogRead(CURRENT_PIN);
  
  #ifdef ESP32_BOARD
  float voltage = (sensorValue / 4095.0) * 3.3;
  #else
  float voltage = (sensorValue / 1023.0) * 5.0;
  #endif
  
  // ACS712 5A module: 185mV per Amp, 2.5V at 0A
  // ACS712 30A module: 66mV per Amp, 2.5V at 0A
  float current = (voltage - 2.5) / 0.185; // For 5A module, change 0.185 to 0.066 for 30A module
  
  return abs(current); // Return absolute value
}

void readGPS() {
  // This is a placeholder for GPS reading
  // Implement based on your GPS module (NEO-6M, etc.)
  // Example with TinyGPS++ library:
  /*
  while (Serial1.available() > 0) {
    if (gps.encode(Serial1.read())) {
      if (gps.location.isValid()) {
        gpsLat = gps.location.lat();
        gpsLon = gps.location.lng();
        gpsValid = true;
      }
    }
  }
  */
}

void sendSensorData(float voltage, float current) {
  Serial.println("\n--- Sending Sensor Data ---");
  Serial.print("Voltage: ");
  Serial.print(voltage);
  Serial.println(" V");
  Serial.print("Current: ");
  Serial.print(current);
  Serial.println(" A");
  
  #ifdef ESP32_BOARD
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["poleId"] = POLE_ID;
    doc["voltage"] = voltage;
    doc["current"] = current;
    
    // Add GPS if available
    if (gpsValid) {
      doc["lat"] = gpsLat;
      doc["lon"] = gpsLon;
    }
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.print("Sending to server: ");
    Serial.println(jsonPayload);
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
  #endif
  
  #ifdef ARDUINO_ETHERNET
  if (client.connect(server, 3000)) {
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["poleId"] = POLE_ID;
    doc["voltage"] = voltage;
    doc["current"] = current;
    
    if (gpsValid) {
      doc["lat"] = gpsLat;
      doc["lon"] = gpsLon;
    }
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.print("Sending to server: ");
    Serial.println(jsonPayload);
    
    // Send HTTP POST request
    client.println("POST /api/poles/sensor-data HTTP/1.1");
    client.println("Host: YOUR_SERVER_IP");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println();
    client.println(jsonPayload);
    
    // Wait for response
    delay(1000);
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
    }
    
    client.stop();
  } else {
    Serial.println("Connection to server failed!");
  }
  #endif
}

