import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, login } from "../lib/authClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Unable to log in right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="max-w-sm mx-auto mt-16 flex flex-col gap-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        aria-label="Email"
        className="border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        aria-label="Password"
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="bg-black text-white py-2" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      <Link to="/" className="text-sm underline">
        Back
      </Link>
    </form>
  );
}
