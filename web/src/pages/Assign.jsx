import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

import Header from "@/components/Header";
import AssignTable from "@/components/AssignTable";
import AssignForm from "@/components/AssignForm";

import AssignService from "@/services/Assign.service";

import { fetchAssigns } from "@/stores/assignSlice";
import { selectFilteredAssigns } from "@/stores/assignSelectors";

import "@/assets/css/Stage.css";

function AssignsView() {
  const dispatch = useDispatch();

  /* =======================
     STORE
  ======================= */
  const assigns = useSelector(selectFilteredAssigns);
  const loading = useSelector((state) => state.assign.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState(null);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => {
    setEditingAssign(null);
    setIsFormOpen(true);
  };

  const onEdit = (assgin) => {
    setEditingAssign(assgin);
    setIsFormOpen(true);
  };

  const onDelete = async (assgin) => {
    await AssignService.deleteAssign(assgin.id);
    message.success("Xóa thành công");
    dispatch(fetchAssigns());
  };

  const onAssignAdded = () => {
    dispatch(fetchAssigns());
    setIsFormOpen(false);
  };

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    dispatch(fetchAssigns());
  }, [dispatch]);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Header page="assign" onAdd={onAdd} />

      <AssignTable
        className="assign-table"
        loading={loading}
        assigns={assigns}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <AssignForm
        open={isFormOpen}
        stage={editingAssign}
        onClose={() => setIsFormOpen(false)}
        onAssignAdded={onAssignAdded}
      />
    </>
  );
}

export default AssignsView;
