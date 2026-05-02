"use server";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get("name")?.toString().trim();
  const company = formData.get("company")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !role || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Log submission — replace with Resend/Nodemailer/webhook in production
  console.log("New contact submission:", { name, company, role, email, message });

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  return { status: "success" };
}
