"use client";

import { useEffect, useState } from "react";
import { getAssignments } from "@/services/assignment.service";
import ReportModal from "@/components/worker/report-modal";

export default function JobsPage() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState<any>(null);
  
  const fetchData = async () => {
    const res = await getAssignments();
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 grid gap-4">
      {data.map((item: any) => (
        <div key={item.id} className="border rounded-xl p-3 shadow">
          <img src={item.image} className="rounded-lg" />
          <h3>{item.operation_name}</h3>
          <p>Giá: {item.price}</p>

          <button onClick={() => setSelected(item)}>
            Báo cáo
          </button>
        </div>
      ))}

      {selected && (
        <ReportModal
          assignment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}