import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useFetcher, useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { ArrowDownRight, ArrowLeft, ChevronDown, LoaderCircle, Pencil, Plus, ReceiptText, Search, Trash2, Wallet } from "lucide-react";
import type { Route } from "./+types/expenses";
import { checkAccess } from "~/lib/access.server";
import { categoryKey, DEFAULT_CATEGORIES, expenseSummary, formatVnd, normalizeAmount, subcategoriesForCategory, type Expense, type ExpenseSubcategory, type PaymentMethod } from "~/modules/expenses/expense-model";
import { ExpenseChoiceField } from "~/modules/expenses/expense-choice-field";
import { parseExpenseInput } from "~/modules/expenses/expense-input";
import { createExpenseCategory, createExpenseSubcategory, deleteExpense, loadExpenseData, saveExpense } from "~/modules/expenses/expense-store.server";
import "~/modules/expenses/expenses.css";

function todayInVietnam() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function selectedMonth(value: string | null, today: string) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : today.slice(0, 7);
}

export async function loader({ request }: Route.LoaderArgs) {
  const access = await checkAccess(request);
  if (access) throw access;
  const today = todayInVietnam();
  const month = selectedMonth(new URL(request.url).searchParams.get("month"), today);
  try {
    return { today, month, ...(await loadExpenseData(month)), loadError: "" };
  } catch (error) {
    return { today, month, configured: true, categories: [] as string[], subcategories: [] as ExpenseSubcategory[], expenses: [] as Expense[], loadError: error instanceof Error ? error.message : "Không tải được dữ liệu." };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const access = await checkAccess(request);
  if (access) throw access;
  const form = await request.formData();
  const intent = String(form.get("intent") || "save");
  try {
    if (intent === "category") {
      const name = String(form.get("category") || "").trim().replace(/\s+/g, " ");
      if (!name || name.length > 60) return { ok: false, error: "Tên nhóm chi cần từ 1 đến 60 ký tự." };
      const category = await createExpenseCategory(name);
      return { ok: true, intent, category: category.name };
    }
    if (intent === "subcategory") {
      const category = String(form.get("category") || "").trim().replace(/\s+/g, " ");
      const name = String(form.get("subcategory") || "").trim().replace(/\s+/g, " ");
      if (!category || category.length > 60 || !name || name.length > 60) return { ok: false, error: "Chọn nhóm chi và nhập tên nhóm con từ 1 đến 60 ký tự." };
      const subcategory = await createExpenseSubcategory(category, name);
      return { ok: true, intent, category, subcategory: subcategory.name };
    }
    if (intent === "delete") {
      const id = String(form.get("id") || "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Khoản chi không hợp lệ." };
      await deleteExpense(id);
      return { ok: true, intent };
    }
    const input = parseExpenseInput(form);
    if (!input) return { ok: false, error: "Kiểm tra lại số tiền, nhóm chi, nhóm con và ngày chi." };
    const id = String(form.get("id") || "");
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Khoản chi không hợp lệ." };
    await saveExpense(input, id || undefined);
    return { ok: true, intent: "save", edited: Boolean(id), savedDate: input.date };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi khi lưu dữ liệu." };
  }
}

export function meta() {
  return [
    { title: "NObar · Quản lý chi phí" },
    { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Ghi chi phí và theo dõi vận hành NObar." },
  ];
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  return `Tháng ${Number(month)} / ${year}`;
}

function amountText(value: string) {
  const amount = normalizeAmount(value);
  return amount ? new Intl.NumberFormat("vi-VN").format(amount) : "";
}

export default function ExpensesRoute() {
  const { today, month, configured, categories: storedCategories, subcategories: storedSubcategories, expenses, loadError } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { revalidate } = useRevalidator();
  const [, setParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"entry" | "ledger">("entry");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [editing, setEditing] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [localSubcategories, setLocalSubcategories] = useState<ExpenseSubcategory[]>([]);
  const [showExtra, setShowExtra] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);
  const lastResponse = useRef<unknown>(null);

  const categories = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...storedCategories, ...localCategories])], [storedCategories, localCategories]);
  const allSubcategories = useMemo(() => [...storedSubcategories, ...localSubcategories], [storedSubcategories, localSubcategories]);
  const subcategories = useMemo(() => subcategoriesForCategory(allSubcategories, category), [allSubcategories, category]);
  const recentCategories = useMemo(() => expenses.slice(0, 20).map((expense) => expense.category), [expenses]);
  const recentSubcategories = useMemo(() => expenses.filter((expense) => categoryKey(expense.category) === categoryKey(category)).map((expense) => expense.subcategory).filter(Boolean), [expenses, category]);
  const summary = useMemo(() => expenseSummary(expenses, month), [expenses, month]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => `${expense.category} ${expense.subcategory} ${expense.note} ${expense.amount}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi"))), [expenses, search]);
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    if (!configured || loadError) return;
    const refresh = () => {
      if (document.visibilityState === "visible") revalidate();
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [configured, loadError, revalidate]);

  /* eslint-disable react-hooks/set-state-in-effect -- A completed fetcher action must reset the entry form and show its result. */
  useEffect(() => {
    const response = fetcher.data;
    if (!response || response === lastResponse.current) return;
    lastResponse.current = response;
    if (!response.ok) {
      setMessage(response.error || "Có lỗi khi lưu dữ liệu.");
      return;
    }
    if (response.intent === "category") {
      const name = response.category || category;
      setLocalCategories((current) => [...current, name]);
      setCategory(name);
      setMessage(`Đã thêm nhóm “${name}”.`);
    } else if (response.intent === "subcategory") {
      const name = response.subcategory || subcategory;
      if (response.category && categoryKey(response.category) === categoryKey(category)) {
        setLocalSubcategories((current) => [...current, { category, name }]);
        setSubcategory(name);
      }
      setMessage(`Đã thêm nhóm con “${name}”.`);
    } else if (response.intent === "delete") {
      setMessage("Đã xóa khoản chi.");
    } else {
      setAmount("");
      setNote("");
      setEditing(null);
      if (response.savedDate && response.savedDate.slice(0, 7) !== month) {
        setParams({ month: response.savedDate.slice(0, 7) });
      }
      setMessage(response.edited ? "Đã cập nhật khoản chi." : "Đã lưu khoản chi. Có thể nhập tiếp.");
      amountRef.current?.focus();
    }
  }, [fetcher.data, category, subcategory, month, setParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function submitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData();
    form.set("intent", "save");
    form.set("amount", String(normalizeAmount(amount)));
    form.set("category", category.trim());
    form.set("subcategory", subcategory.trim());
    form.set("note", note);
    form.set("date", date);
    form.set("paymentMethod", paymentMethod);
    if (editing) form.set("id", editing);
    fetcher.submit(form, { method: "post" });
  }

  function createCategory(name: string) {
    if (!name || busy || !configured) return;
    const form = new FormData();
    form.set("intent", "category");
    form.set("category", name);
    fetcher.submit(form, { method: "post" });
  }

  function createSubcategory(name: string) {
    if (!name || !category.trim() || busy || !configured) return;
    const form = new FormData();
    form.set("intent", "subcategory");
    form.set("category", category.trim());
    form.set("subcategory", name);
    fetcher.submit(form, { method: "post" });
  }

  function changeCategory(name: string) {
    if (categoryKey(name) !== categoryKey(category)) setSubcategory("");
    setCategory(name);
  }

  function editExpense(expense: Expense) {
    setEditing(expense.id);
    setAmount(amountText(String(expense.amount)));
    setCategory(expense.category);
    setSubcategory(expense.subcategory);
    setNote(expense.note);
    setDate(expense.date);
    setPaymentMethod(expense.paymentMethod);
    setShowExtra(Boolean(expense.note) || expense.date !== today || expense.paymentMethod !== "cash");
    setActiveTab("entry");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => amountRef.current?.focus(), 200);
  }

  function removeExpense(expense: Expense) {
    if (!window.confirm(`Xóa khoản chi ${formatVnd(expense.amount)} cho ${expense.category}?`)) return;
    const form = new FormData();
    form.set("intent", "delete");
    form.set("id", expense.id);
    fetcher.submit(form, { method: "post" });
  }

  function changeMonth(value: string) {
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) setParams({ month: value });
  }

  return (
    <main className="expense-app">
      <div className="expense-shell">
        <header className="expense-header">
          <Link to="/insights" className="expense-back" aria-label="Về báo cáo"><ArrowLeft size={18} /></Link>
          <div className="expense-brand"><strong>NO<span>bar</span></strong><small>VẬN HÀNH / CHI PHÍ</small></div>
          <div className="expense-header-right"><span className="expense-live-dot" /> NỘI BỘ</div>
        </header>

        <div className="expense-content">
          <section className="expense-intro">
            <div><p className="expense-eyebrow">SỔ CHI QUÁN · ĐÀ LẠT</p><h1>Ghi chi phí<span>.</span></h1><p>Vừa chi xong, ghi ngay tại đây.</p></div>
            <div className="expense-intro-date">{formatDate(today)}<span>HÔM NAY</span></div>
          </section>

          {!configured && <div className="expense-alert" role="alert"><strong>Chưa kết nối dữ liệu.</strong><span>Cần thiết lập Supabase để lưu dùng chung.</span></div>}
          {loadError && <div className="expense-alert" role="alert"><strong>Không tải được dữ liệu.</strong><span>{loadError}</span></div>}

          <nav className="expense-mobile-tabs" aria-label="Mục chi phí"><button type="button" className={activeTab === "entry" ? "active" : ""} onClick={() => setActiveTab("entry")}><Plus size={18} /> Nhập chi</button><button type="button" className={activeTab === "ledger" ? "active" : ""} onClick={() => setActiveTab("ledger")}><ReceiptText size={18} /> Sổ chi</button></nav>

          <div className="expense-grid">
            <section className={`expense-entry ${activeTab === "entry" ? "mobile-active" : ""}`} aria-labelledby="entry-heading">
              <div className="expense-section-head"><div><span className="expense-section-kicker">01 / NHẬP NHANH</span><h2 id="entry-heading">{editing ? "Sửa khoản chi" : "Thêm khoản chi"}</h2></div><span className="expense-step">~ 10 GIÂY</span></div>
              <form onSubmit={submitExpense}>
                <label className="expense-label" htmlFor="expense-amount">SỐ TIỀN</label>
                <div className="expense-amount-wrap"><input id="expense-amount" ref={amountRef} inputMode="numeric" autoComplete="off" placeholder="0" value={amount} onChange={(event) => setAmount(amountText(event.target.value))} aria-describedby="amount-hint" /><span>₫</span></div>
                <p id="amount-hint" className="expense-field-hint">Nhập số tiền, không cần dấu chấm.</p>

                <ExpenseChoiceField id="expense-category" label="NHÓM CHI" hint="Tìm hoặc thêm" value={category}
                  onChange={changeCategory} options={categories} recent={recentCategories} placeholder="Ví dụ: Chi phí rượu"
                  createLabel="Tạo nhóm" onCreate={createCategory} canCreate={configured && !busy && !loadError} />

                {category.trim() && <ExpenseChoiceField id="expense-subcategory" label="NHÓM CHI CON" hint="Tìm hoặc thêm"
                  value={subcategory} onChange={setSubcategory} options={subcategories} recent={recentSubcategories}
                  placeholder="Ví dụ: Khoản cụ thể" createLabel="Tạo nhóm con" onCreate={createSubcategory}
                  canCreate={configured && !busy && !loadError} optional />}

                <button className="expense-more-toggle" type="button" aria-expanded={showExtra} aria-controls="expense-extra"
                  onClick={() => setShowExtra((current) => !current)}>
                  <span>{showExtra ? "Ẩn ghi chú" : note ? "Sửa ghi chú" : "Thêm ghi chú"}</span>
                  <small>{date === today ? "Hôm nay" : formatDate(date)} · {paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</small>
                  <ChevronDown size={16} className={showExtra ? "up" : ""} />
                </button>
                <div id="expense-extra" hidden={!showExtra}>
                  <label className="expense-label expense-note-label" htmlFor="expense-note">GHI CHÚ <span>KHÔNG BẮT BUỘC</span></label>
                  <textarea className="expense-note" id="expense-note" rows={3} value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} placeholder="Mua ở đâu, chi cho việc gì..." />
                  <div className="expense-detail-row"><label><span>NGÀY CHI</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><fieldset><legend>THANH TOÁN</legend><div className="expense-payment"><button type="button" className={paymentMethod === "cash" ? "selected" : ""} onClick={() => setPaymentMethod("cash")}>Tiền mặt</button><button type="button" className={paymentMethod === "transfer" ? "selected" : ""} onClick={() => setPaymentMethod("transfer")}>Chuyển khoản</button></div></fieldset></div>
                </div>

                {message && <p className={`expense-message ${fetcher.data?.ok ? "success" : "error"}`} role="status">{message}</p>}
                <div className="expense-submit-bar"><button className="expense-submit" type="submit" disabled={!configured || !!loadError || busy || normalizeAmount(amount) < 1 || !category.trim()}>{busy ? <LoaderCircle className="expense-spin" size={20} /> : <Plus size={20} />} {editing ? "Lưu thay đổi" : "Lưu khoản chi"}<span>→</span></button>{editing && <button className="expense-cancel" type="button" onClick={() => { setEditing(null); setAmount(""); setSubcategory(""); setNote(""); setDate(today); setPaymentMethod("cash"); setShowExtra(false); }}>Hủy sửa</button>}</div>
              </form>
            </section>

            <section className={`expense-ledger ${activeTab === "ledger" ? "mobile-active" : ""}`} aria-labelledby="ledger-heading">
              <div className="expense-section-head"><div><span className="expense-section-kicker">02 / THEO DÕI</span><h2 id="ledger-heading">Sổ chi</h2></div><Wallet size={20} /></div>
              <div className="expense-month-picker"><label htmlFor="expense-month">KỲ XEM</label><input id="expense-month" type="month" value={month} onChange={(event) => changeMonth(event.target.value)} /><span>{monthLabel(month)}</span></div>
              <div className="expense-total-card"><span>TỔNG CHI THÁNG NÀY</span><strong>{formatVnd(summary.total)}</strong><div><ArrowDownRight size={17} /> {summary.count} khoản chi đã ghi</div></div>
              <div className="expense-revenue-note"><span>DOANH THU · POSAPP</span><strong>Chưa kết nối</strong><p>Doanh thu sẽ tự đồng bộ khi có quyền truy cập API PosApp của quán.</p></div>
              {summary.byCategory.length > 0 && <div className="expense-breakdown"><h3>Chi theo nhóm</h3>{summary.byCategory.slice(0, 5).map((item) => <div key={item.category} className="expense-breakdown-row"><div><span>{item.category}</span><strong>{formatVnd(item.total)}</strong></div><div className="expense-bar"><i style={{ width: `${(item.total / summary.total) * 100}%` }} /></div></div>)}</div>}
              <div className="expense-list-head"><h3>Khoản chi trong tháng</h3><span>{filteredExpenses.length} MỤC</span></div>
              {expenses.length > 5 && <label className="expense-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhóm chi hoặc ghi chú" /></label>}
              <div className="expense-list">{filteredExpenses.map((expense) => <article className="expense-item" key={expense.id}><div className="expense-item-icon"><ReceiptText size={18} /></div><div className="expense-item-copy"><strong>{expense.category}{expense.subcategory && <span className="expense-item-subcategory"> / {expense.subcategory}</span>}</strong><span>{formatDate(expense.date)} · {expense.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</span>{expense.note && <p>{expense.note}</p>}</div><div className="expense-item-right"><strong>{formatVnd(expense.amount)}</strong><div><button type="button" onClick={() => editExpense(expense)} aria-label={`Sửa khoản chi ${expense.category}`}><Pencil size={15} /></button><button type="button" onClick={() => removeExpense(expense)} aria-label={`Xóa khoản chi ${expense.category}`}><Trash2 size={15} /></button></div></div></article>)}{filteredExpenses.length === 0 && <div className="expense-empty"><ReceiptText size={27} /><strong>{search ? "Không tìm thấy khoản chi" : "Chưa có khoản chi tháng này"}</strong><p>{search ? "Thử từ khóa khác." : "Khoản chi đầu tiên sẽ xuất hiện tại đây sau khi lưu."}</p></div>}</div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
