type ReportsPanelProps = {
  faultCount: number;
  totalPoles: number;
};

function ReportsPanel({ faultCount, totalPoles }: ReportsPanelProps) {
  return (
    <section id="reports" className="section">
      <h2>Reports &amp; Statistics</h2>
      <div className="info-box">
        <h3>Total Poles:</h3>
        <p>{totalPoles}</p>
      </div>
      <div className="info-box">
        <h3>Total Faults Recorded:</h3>
        <p>{faultCount}</p>
      </div>
    </section>
  );
}

export default ReportsPanel;


