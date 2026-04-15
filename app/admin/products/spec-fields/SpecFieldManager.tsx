"use client";

import { useActionState } from "react";
import { createProductSpecField, deleteProductSpecField } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type FieldRow = { id: string; name: string; unit: string | null; sortOrder: number; type: { name: string } };
type TypeOption = { id: string; name: string };

export function SpecFieldManager({ types, fields }: { types: TypeOption[]; fields: FieldRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProductSpecField, undefined);

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">스펙 항목 관리</h2>
      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류</label>
            <select name="typeId" required className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
              <option value="">선택</option>
              {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">항목명</label>
            <input name="name" placeholder="예: 최대허용하중" className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">단위</label>
            <input name="unit" placeholder="예: kg" className="h-9 w-20 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={pending} className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && <p className="text-xs text-error mt-2">{state.message}</p>}
      </form>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {fields.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 스펙 항목이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-left">항목명</th>
                <th className="px-4 py-2.5 text-left">단위</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-muted">{f.type.name}</td>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3 text-muted">{f.unit || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductSpecField.bind(null, f.id)}>
                      <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
