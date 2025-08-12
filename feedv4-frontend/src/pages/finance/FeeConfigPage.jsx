import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeeConfigList from "../../components/Finance/FeeConfigList";
import FeeConfigForm from "../../components/Finance/FeeConfigForm";

export default function FeeConfigPage() {
  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden"
    style={{maxWidth: 'calc(100vw - 258px)'
      }}>
    <Routes>
      {/* default -> list */}
      <Route index element={<FeeConfigList />} />
      {/* create new */}
      <Route path="new" element={<FeeConfigForm />} />
      {/* edit existing */}
      <Route path=":id/edit" element={<FeeConfigForm />} />
      {/* anything else -> list */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
    </div>
  );
}
