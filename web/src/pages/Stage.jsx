import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { message } from "antd";

import Header from "@/components/Header";
import StageTable from "@/components/StageTable";
import StageForm from "@/components/StageForm";

import StageService from "@/services/Stage.service";

import { fetchStages } from "@/stores/stageSlice";
import { selectFilteredStages } from "@/stores/stageSelectors";

import "@/assets/css/Stage.css";

function StagesView() {
  const dispatch = useDispatch();
  const location = useLocation();
  const product = location.state?.product;

  /* =======================
     STORE
  ======================= */
  const stages = useSelector((state) => selectFilteredStages(state, product.id));
  const loading = useSelector((state) => state.stage.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => {
    setEditingStage(null);
    setIsFormOpen(true);
  };

  const onEdit = (stage) => {
    setEditingStage(stage);
    setIsFormOpen(true);
  };

  const onDelete = async (stage) => {
    await StageService.deleteStage(stage.id);
    message.success("Xóa thành công");
    dispatch(fetchStages(product.id));
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
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <StageForm
        open={isFormOpen}
        stage={editingStage}
        onClose={() => setIsFormOpen(false)}
        onStageAdded={onStageAdded}
      />
    </>
  );
}

export default StagesView;
