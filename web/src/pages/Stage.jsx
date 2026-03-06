import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Header from "@/components/Header";
import StageTable from "@/components/StageTable";
import StageForm from "@/components/StageForm";

import { fetchStages, updateStage } from "@/stores/stageSlice";
import { selectFilteredStages } from "@/stores/stageSelectors";

import "@/assets/css/Stage.css";

function StagesView() {
  const dispatch = useDispatch();
  const location = useLocation();
  const product = location.state?.product;

  /* =======================
     STORE
  ======================= */
  const stages = useSelector(selectFilteredStages);
  const loading = useSelector((state) => state.stage.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => setIsFormOpen(true);

  const onUpdateStage = (payload) => {
    dispatch(updateStage(payload));
  };

  const onStageAdded = () => {
    dispatch(fetchStages(product.id));
    setIsFormOpen(false);
  };

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    dispatch(fetchStages(product.id));
  }, [dispatch, product.id]);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Header page="stage" product={product} onAdd={onAdd} />

      <StageTable
        className="stage-table"
        loading={loading}
        stages={stages}
        onUpdateStage={onUpdateStage}
      />

      <StageForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onStageAdded={onStageAdded}
      />
    </>
  );
}

export default StagesView;
