"use client";

import { useState } from "react";
import { createReport } from "@/services/report.service";

export default function ReportModal({ assignment, onClose }: any) {
  const [quantity, setQuantity] = useState(0);

  const handleSubmit = async () => {
    await createReport({
      assignment_id: assignment.id,
      quantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h2>Nhập số lượng</h2>
        <input
          type="number"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={handleSubmit}>Gửi</button>
      </div>
    </div>
  );
}