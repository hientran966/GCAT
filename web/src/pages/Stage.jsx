import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

import Header from "@/components/Header";
import StageTable from "@/components/StageTable";
import StageForm from "@/components/StageForm";
import AssignForm from "@/components/AssignForm";

import StageService from "@/services/Stage.service";

import { fetchStages } from "@/stores/stageSlice";
import { selectFilteredStages } from "@/stores/stageSelectors";

import "@/assets/css/Stage.css";

function StagesView() {
  const dispatch = useDispatch();
  /* =======================
     STORE
  ======================= */
  const stages = useSelector(selectFilteredStages);
  const loading = useSelector((state) => state.stage.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => {
    setSelectedStage(null);
    setIsFormOpen(true);
  };

  const onAssign = (stage) => {
    setSelectedStage(stage);
    setIsAssignFormOpen(true);
  }

  const onEdit = (stage) => {
    setSelectedStage(stage);
    setIsFormOpen(true);
  };

  const onDelete = async (stage) => {
    await StageService.deleteStage(stage.id);
    message.success("Xóa thành công");
    dispatch(fetchStages());
  };

  const onStageAdded = () => {
    dispatch(fetchStages());
    setIsFormOpen(false);
    setSelectedStage(null);
  };

  const onAssignAdded = () => {
    setSelectedStage(null);
    setIsAssignFormOpen(false);
  };

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    dispatch(fetchStages());
  }, [dispatch]);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Header page="stage" onAdd={onAdd} />

      <StageTable
        className="stage-table"
        loading={loading}
        stages={stages}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssign={onAssign}
      />

      <StageForm
        open={isFormOpen}
        stage={selectedStage}
        onClose={() => setIsFormOpen(false)}
        onStageAdded={onStageAdded}
      />
      <AssignForm
        open={isAssignFormOpen}
        onClose={() => setIsAssignFormOpen(false)}
        onAssignAdded={onAssignAdded}
        stage={selectedStage}
      />
    </>
  );
}

export default StagesView;
