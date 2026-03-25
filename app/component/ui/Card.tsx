type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div className="border rounded-xl p-5 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  );
}
