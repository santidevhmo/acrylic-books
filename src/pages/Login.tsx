import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="max-w-sm mx-auto mt-16 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="border p-2" type="email" placeholder="Email" />
      <input className="border p-2" type="password" placeholder="Password" />
      <button className="bg-black text-white py-2">Submit</button>
      <Link to="/" className="text-sm underline">
        Back
      </Link>
    </div>
  );
}
