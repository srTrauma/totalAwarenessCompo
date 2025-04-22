import React from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import "@/app/globals.css";
const LoginError: React.FC = () => {
    const router = useRouter();


  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <h1>Error el el login</h1>
      <div onClick={() => router.push("/")}>
      <Button Text="Go to Home" blue />
      </div>
    </div>
  );
}
export default LoginError;