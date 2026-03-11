/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Header from "@/components/Header";

import WorkerInfo from "@/components/WorkerInfo";
import WorkerAssignments from "@/components/WorkerAssignments";
import WorkerMonthlyChart from "@/components/WorkerMonthlyChart";

import { fetchAccountDetail } from "@/stores/accountSlice";
import { selectAccountDetail } from "@/stores/accountSelectors";

import "@/assets/css/WorkerDetail.css";

export default function WorkerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const worker = useSelector(selectAccountDetail);

  useEffect(() => {
    dispatch(fetchAccountDetail(id));
  }, [id]);

  return (
    <div>
      <Header
        page="worker"
        view="detail"
        account={worker}
      />

      <div className="detail-container">

        {/* Worker Info */}
        <WorkerInfo worker={worker} />

        {/* Assignments */}
        <WorkerAssignments
          assignments={worker?.assignments}
        />

        {/* Chart */}
        <WorkerMonthlyChart
          data={worker?.monthlyStats}
        />

      </div>
    </div>
  );
}