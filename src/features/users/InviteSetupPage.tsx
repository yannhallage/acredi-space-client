import { useState } from "react";

import {
  InvitePasswordStep,
  InviteProfileStep,
  InviteSuccessStep,
} from "./components";

export function InviteSetupPage() {
  const [step, setStep] = useState(1);

  function handlePasswordNext(password: string) {
    console.log("password:", password);
    setStep(2);
  }

  return (
    <>
      {step === 1 && <InvitePasswordStep onNext={handlePasswordNext} />}

      {step === 2 && (
        <InviteProfileStep
          onPrevious={() => setStep(1)}
          onNext={(data) => {
            console.log("profile data:", data);
            setStep(3);
          }}
        />
      )}

      {step === 3 && <InviteSuccessStep />}
    </>
  );
}
