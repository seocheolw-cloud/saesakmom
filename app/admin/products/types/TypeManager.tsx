"use client";

import { useActionState, useState, useTransition, useCallback, useEffect } from "react";
import { createProductType, deleteProductType, batchSaveTypeConfig } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type SpecField = { id: string; name: string; unit: string | null; sortOrder: number };
type ProductTypeRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count: { products: number; brands: number };
  specFields: SpecField[];
};

type LocalSpec = { id?: string; tempId: string; name: string; unit: string | null };

export function TypeManager({ types: serverTypes }: { types: ProductTypeRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProductType, undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  // 로컬 상태: 종류 순서
  const [localTypeOrder, setLocalTypeOrder] = useState<string[]>(serverTypes.map((t) => t.id));

  // 로컬 상태: 각 종류별 스펙 목록
  const [localSpecs, setLocalSpecs] = useState<Record<string, LocalSpec[]>>(() => {
    const m: Record<string, LocalSpec[]> = {};
    for (const t of serverTypes) {
      m[t.id] = t.specFields.map((f) => ({ id: f.id, tempId: f.id, name: f.name, unit: f.unit }));
    }
    return m;
  });

  const [saveResult, setSaveResult] = useState<{ message?: string; success?: boolean } | null>(null);

  // serverTypes가 변경되면 로컬 상태 동기화 (새 종류 추가, 적용 후 등)
  const serverKey = serverTypes.map((t) => t.id).join(",") + "|" + serverTypes.map((t) => t.specFields.map((f) => f.id).join("-")).join(",");
  useEffect(() => {
    setLocalTypeOrder(serverTypes.map((t) => t.id));
    const m: Record<string, LocalSpec[]> = {};
    for (const t of serverTypes) {
      m[t.id] = t.specFields.map((f) => ({ id: f.id, tempId: f.id, name: f.name, unit: f.unit }));
    }
    setLocalSpecs(m);
  }, [serverKey]);

  // 변경 여부 체크
  const hasChanges = useCallback(() => {
    const serverOrder = serverTypes.map((t) => t.id);
    if (JSON.stringify(localTypeOrder) !== JSON.stringify(serverOrder)) return true;
    for (const t of serverTypes) {
      const local = localSpecs[t.id] || [];
      const server = t.specFields;
      if (local.length !== server.length) return true;
      for (let i = 0; i < local.length; i++) {
        if (local[i].id !== server[i]?.id || local[i].name !== server[i]?.name || local[i].unit !== (server[i]?.unit ?? null)) return true;
      }
    }
    return false;
  }, [localTypeOrder, localSpecs, serverTypes]);

  const changed = hasChanges();

  // 종류 순서 변경
  function moveType(index: number, dir: "up" | "down") {
    setLocalTypeOrder((prev) => {
      const arr = [...prev];
      const swap = dir === "up" ? index - 1 : index + 1;
      [arr[index], arr[swap]] = [arr[swap], arr[index]];
      return arr;
    });
    setSaveResult(null);
  }

  // 스펙 조작
  function addSpec(typeId: string, name: string, unit: string) {
    setLocalSpecs((prev) => ({
      ...prev,
      [typeId]: [...(prev[typeId] || []), { tempId: `new-${Date.now()}`, name, unit: unit || null }],
    }));
    setSaveResult(null);
  }

  function removeSpec(typeId: string, tempId: string) {
    setLocalSpecs((prev) => ({
      ...prev,
      [typeId]: (prev[typeId] || []).filter((s) => s.tempId !== tempId),
    }));
    setSaveResult(null);
  }

  function updateSpec(typeId: string, tempId: string, name: string, unit: string) {
    setLocalSpecs((prev) => ({
      ...prev,
      [typeId]: (prev[typeId] || []).map((s) => s.tempId === tempId ? { ...s, name, unit: unit || null } : s),
    }));
    setSaveResult(null);
  }

  function moveSpec(typeId: string, index: number, dir: "up" | "down") {
    setLocalSpecs((prev) => {
      const arr = [...(prev[typeId] || [])];
      const swap = dir === "up" ? index - 1 : index + 1;
      [arr[index], arr[swap]] = [arr[swap], arr[index]];
      return { ...prev, [typeId]: arr };
    });
    setSaveResult(null);
  }

  // 적용
  function handleApply() {
    const specsByType: Record<string, { id?: string; name: string; unit: string | null }[]> = {};
    for (const [typeId, specs] of Object.entries(localSpecs)) {
      specsByType[typeId] = specs.map((s) => ({ id: s.id, name: s.name, unit: s.unit }));
    }
    startSave(async () => {
      const res = await batchSaveTypeConfig(localTypeOrder, specsByType);
      setSaveResult(res);
    });
  }

  // 초기화
  function handleReset() {
    setLocalTypeOrder(serverTypes.map((t) => t.id));
    const m: Record<string, LocalSpec[]> = {};
    for (const t of serverTypes) {
      m[t.id] = t.specFields.map((f) => ({ id: f.id, tempId: f.id, name: f.name, unit: f.unit }));
    }
    setLocalSpecs(m);
    setSaveResult(null);
  }

  // 종류를 localTypeOrder 기준으로 정렬
  const orderedTypes = localTypeOrder.map((id) => serverTypes.find((t) => t.id === id)!).filter(Boolean);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">종류 관리</h2>
        {changed && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded animate-pulse">변경사항 있음</span>
        )}
      </div>

      {/* 종류 추가 (즉시 적용) */}
      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-muted mb-1">새 종류 추가</label>
            <input name="name" placeholder="예: 카시트" className="h-9 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" disabled={pending} className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && <p className="text-xs text-red-500 mt-2">{state.message}</p>}
        {state?.errors?.name && <p className="text-xs text-red-500 mt-2">{state.errors.name[0]}</p>}
      </form>

      {/* 종류 목록 */}
      <div className="space-y-3">
        {orderedTypes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">등록된 종류가 없습니다.</div>
        ) : (
          orderedTypes.map((t, typeIndex) => {
            const isOpen = expandedId === t.id;
            const specs = localSpecs[t.id] || [];
            return (
              <div key={t.id} className={`bg-white rounded-xl border overflow-hidden transition-colors ${isOpen ? "border-primary/40" : "border-[#d4d4d4]"}`}>
                {/* 종류 헤더 */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${isOpen ? "bg-blue-50" : "hover:bg-[#f8faff]"}`}
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => moveType(typeIndex, "up")} disabled={typeIndex === 0} className="w-5 h-3.5 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-20 rounded hover:bg-gray-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button type="button" onClick={() => moveType(typeIndex, "down")} disabled={typeIndex === orderedTypes.length - 1} className="w-5 h-3.5 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-20 rounded hover:bg-gray-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    <svg className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="text-[11px] text-muted hidden sm:inline">브랜드 {t._count.brands} / 상품 {t._count.products}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted bg-gray-100 px-2 py-0.5 rounded">스펙 {specs.length}개</span>
                    {t._count.products === 0 && (
                      <form action={deleteProductType.bind(null, t.id)} onSubmit={(e) => { e.stopPropagation(); if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault(); }}>
                        <button type="submit" onClick={(e) => e.stopPropagation()} className="text-xs text-red-500 hover:opacity-75 px-2 py-1">삭제</button>
                      </form>
                    )}
                  </div>
                </div>

                {/* 스펙 관리 패널 */}
                {isOpen && (
                  <div className="border-t border-border">
                    <div className="px-4 pt-3 pb-1">
                      <h4 className="text-xs font-semibold text-foreground mb-2">스펙 항목</h4>
                    </div>

                    {specs.length > 0 ? (
                      <div className="mx-4 mb-3 rounded-lg border border-border overflow-hidden divide-y divide-border">
                        {specs.map((spec, i) => (
                          <SpecRow
                            key={spec.tempId}
                            spec={spec}
                            isFirst={i === 0}
                            isLast={i === specs.length - 1}
                            onMoveUp={() => moveSpec(t.id, i, "up")}
                            onMoveDown={() => moveSpec(t.id, i, "down")}
                            onUpdate={(name, unit) => updateSpec(t.id, spec.tempId, name, unit)}
                            onDelete={() => removeSpec(t.id, spec.tempId)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted px-4 mb-3">등록된 스펙 항목이 없습니다.</p>
                    )}

                    <SpecAddForm onAdd={(name, unit) => addSpec(t.id, name, unit)} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 적용 바 */}
      {changed && (
        <div className="sticky bottom-0 mt-4 bg-white rounded-xl border border-[#d4d4d4] shadow-lg p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm text-foreground font-medium">저장되지 않은 변경사항이 있습니다</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleReset} className="h-9 px-4 rounded-lg border border-[#d4d4d4] text-sm font-medium text-muted hover:text-foreground hover:border-foreground transition-colors">
              되돌리기
            </button>
            <button type="button" onClick={handleApply} disabled={saving} className="h-9 px-6 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
              {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {saving ? "적용 중..." : "적용"}
            </button>
          </div>
        </div>
      )}

      {saveResult?.success && !changed && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="text-sm text-green-700">변경사항이 적용되었습니다.</span>
        </div>
      )}

      {saveResult?.message && !saveResult.success && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span className="text-sm text-red-600">{saveResult.message}</span>
        </div>
      )}
    </div>
  );
}

function SpecRow({ spec, isFirst, isLast, onMoveUp, onMoveDown, onUpdate, onDelete }: {
  spec: LocalSpec;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (name: string, unit: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(spec.name);
  const [unit, setUnit] = useState(spec.unit ?? "");

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50">
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-7 flex-1 px-2 border border-primary rounded text-xs focus:outline-none" autoFocus />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="단위" className="h-7 w-16 px-2 border border-[#d4d4d4] rounded text-xs focus:outline-none focus:border-primary" />
        <button type="button" onClick={() => { if (name.trim()) { onUpdate(name.trim(), unit.trim()); setEditing(false); } }} className="h-7 px-2 rounded bg-primary text-[11px] font-semibold text-white">확인</button>
        <button type="button" onClick={() => { setName(spec.name); setUnit(spec.unit ?? ""); setEditing(false); }} className="h-7 px-2 rounded border border-[#d4d4d4] text-[11px] text-muted">취소</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 group">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="w-4 h-3 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="w-4 h-3 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
        <span className="text-sm text-foreground">{spec.name}</span>
        {spec.unit && <span className="text-xs text-muted">({spec.unit})</span>}
        {!spec.id && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">신규</span>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => setEditing(true)} className="h-6 px-2 rounded text-[11px] text-primary hover:bg-blue-50 transition-colors">수정</button>
        <button type="button" onClick={() => { if (confirm("삭제하시겠습니까?")) onDelete(); }} className="h-6 px-2 rounded text-[11px] text-red-500 hover:bg-red-50 transition-colors">삭제</button>
      </div>
    </div>
  );
}

function SpecAddForm({ onAdd }: { onAdd: (name: string, unit: string) => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), unit.trim());
    setName("");
    setUnit("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end px-4 pb-4">
      <div className="flex-1 min-w-[120px]">
        <label className="block text-[11px] text-muted mb-1">항목명</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 최대허용하중" className="h-8 w-full px-2.5 border border-[#d4d4d4] rounded-md text-xs focus:outline-none focus:border-primary" required />
      </div>
      <div className="w-20">
        <label className="block text-[11px] text-muted mb-1">단위</label>
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="예: kg" className="h-8 w-full px-2.5 border border-[#d4d4d4] rounded-md text-xs focus:outline-none focus:border-primary" />
      </div>
      <button type="submit" className="h-8 px-3 rounded-md bg-gray-600 text-xs font-semibold text-white hover:bg-gray-700 transition-colors">추가</button>
    </form>
  );
}
