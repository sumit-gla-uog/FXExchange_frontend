import { useNavigate } from "react-router-dom";
import { Card, StackLayout, H2, Text, Button } from "@salt-ds/core";

export const SelectRolePage =() =>  {
  const navigate = useNavigate();

  const pick = (role: "customer" | "admin") => {
    localStorage.setItem("active_role", role);
    navigate(role === "customer" ? "/customer" : "/admin", { replace: true });
  };

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

            <Button appearance="outlined" onClick={() => pick("admin")}>
              Continue as Admin
            </Button>
          </StackLayout>
        </StackLayout>
      </Card>
    </div>
  );
}