import type { Route } from "./+types/unlock";
import {
  data,
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import {
  createAccessCookie,
  safeReturnPath,
  verifyPassword,
} from "~/lib/access.server";

export function meta() {
  return [
    { title: "NObar · Đăng nhập" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return { next: safeReturnPath(url.searchParams.get("next")) };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const password = form.get("password");
  const next = safeReturnPath(form.get("next"));

  if (typeof password !== "string") {
    return data({ error: "Nhập mật khẩu để tiếp tục." }, { status: 400 });
  }
  try {
    if (!(await verifyPassword(password))) {
      return data({ error: "Mật khẩu không đúng hoặc chưa được thiết lập." }, { status: 401 });
    }
    return redirect(next, {
      headers: { "Set-Cookie": await createAccessCookie() },
    });
  } catch {
    return data({ error: "Không kiểm tra được mật khẩu trên Supabase. Vui lòng thử lại." }, { status: 503 });
  }
}

export default function UnlockRoute() {
  const { next } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#11100f] px-5 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-8 shadow-2xl">
        <a
          href="/"
          className="text-xs uppercase tracking-[0.3em] text-white/60"
        >
          NObar Đà Lạt
        </a>
        <h1 className="mt-8 text-2xl font-semibold">Trang nội bộ</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Nhập mật khẩu để tiếp tục. Thiết bị này sẽ ghi nhớ đăng nhập trong 60 ngày.
        </p>
        <Form method="post" className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="access-password" className="mb-2 block text-sm">
              Mật khẩu
            </label>
            <input
              id="access-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              aria-invalid={Boolean(actionData?.error)}
              aria-describedby={actionData?.error ? "access-error" : undefined}
              className="w-full rounded-lg border border-white/25 bg-black/40 px-4 py-3 outline-none focus:border-white"
            />
            {actionData?.error && (
              <p
                id="access-error"
                role="alert"
                className="mt-2 text-sm text-red-300"
              >
                {actionData.error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-white/85"
          >
            Tiếp tục
          </button>
        </Form>
      </div>
    </main>
  );
}
