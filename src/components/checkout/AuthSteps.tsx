// The four-dot progress indicator at the top of each checkout step.
export function AuthSteps({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="auth-steps" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={"auth-step" + (n < step ? " is-done" : n === step ? " is-active" : "")}
        ></span>
      ))}
    </div>
  );
}

/** Customer has a name and a default address with postcode on file. */
export function hasFullProfile(
  customer: { firstName?: string; lastName?: string } | null,
  address: { full?: string; postal?: string } | null,
): boolean {
  return !!(customer?.firstName && customer.lastName && address?.full && address.postal);
}
