import QRCodeCanvas from "./Code";

export default function Page() {
  return (
    <div>
      <QRCodeCanvas url="https://example.com" size={256} />
    </div>
  );
}
