const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2">
      {children}
    </div>
  );
};

export default AuthLayout;
