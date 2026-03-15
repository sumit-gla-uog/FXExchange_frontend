import { useNavigate } from "react-router-dom";
import { Card, StackLayout, H2, Text, Button } from "@salt-ds/core";
import { fetcher } from "../../api/swr";
import { getAccessToken } from "../../api/client";
import useSWR from "swr";

export const SelectRolePage =() =>  {
  const navigate = useNavigate();
  const token = getAccessToken();

  const { data, isLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher
  );

  const pick = (role: "customer" | "admin") => {
    // Admin role only actual admin can select
    if (role === "admin" && data?.user?.role !== "admin") {
      alert("You don't have admin access.");
      return;
    }
    localStorage.setItem("active_role", role);
    navigate(role === "customer" ? "/customer" : "/admin", { replace: true });
  };

  if (isLoading) return <p>Loading...</p>;
 
  const isAdmin = data?.user?.role === "admin";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <Card style={{ width: "min(520px, 92vw)", padding: 24 }}>
        <StackLayout gap={2}>
          <div>
            <H2>Select Role</H2>
            <Text styleAs="secondary">Choose how you want to continue.</Text>
          </div>

          <StackLayout gap={1}>
            <Button appearance="solid" sentiment="accented" onClick={() => pick("customer")}>
              Continue as Customer
            </Button>

             {isAdmin && (
              <Button appearance="outlined" onClick={() => pick("admin")}>
                Continue as Admin
              </Button>
            )}
          </StackLayout>
        </StackLayout>
      </Card>
    </div>
  );
}