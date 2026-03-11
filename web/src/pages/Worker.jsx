import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

import Header from "@/components/Header";
import AccountTable from "@/components/AccountTable";
import AccountForm from "@/components/AccountForm";

import AccountService from "@/services/Account.service";

import { fetchAccounts } from "@/stores/accountSlice";
import { selectFilteredAccounts } from "@/stores/accountSelectors";

import "@/assets/css/Accounts.css";

function WorkersView() {
  const dispatch = useDispatch();

  /* =======================
     STORE
  ======================= */
  const accounts = useSelector(selectFilteredAccounts);
  const loading = useSelector((state) => state.account.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const onEdit = (account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const onDelete = async (account) => {
    await AccountService.deleteAccount(account.id);
    message.success("Xóa thành công");
    dispatch(fetchAccounts());
  };

  const onAccountAdded = () => {
    dispatch(fetchAccounts());
    setIsFormOpen(false);
  };

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Header page="worker" onAdd={onAdd} />

      <AccountTable
        className="worker-table"
        loading={loading}
        accounts={accounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <AccountForm
        open={isFormOpen}
        account={editingAccount}
        onClose={() => setIsFormOpen(false)}
        onAccountAdded={onAccountAdded}
      />
    </>
  );
}

export default WorkersView;
