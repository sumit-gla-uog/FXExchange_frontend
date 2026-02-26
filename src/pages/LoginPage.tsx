import { useMemo, useState } from "react";
import { useForm,Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Card,
  StackLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  Button,
  Link,
  H2,
  H3,
  Text,
} from "@salt-ds/core";
import { login } from "../api/auth";

type LoginForm = {
  username: string;
  password: string;
};

export const LoginPage = () =>{
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const {username,password} = data

    try {
      await login(username, password);
      navigate("/landing");
    } catch (e: any) {
      setError("password", { message: e?.message ?? "Login failed" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 32, maxWidth: 400 }}>
      <h1>Login</h1>

      <div style={{ marginTop: 12 }}>
        <input placeholder="Username" {...register("username", { required: "Username required" })} />
        {errors.username && <p>{errors.username.message}</p>}
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password required" })}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button disabled={isSubmitting} style={{ marginTop: 16 }}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}