import Image from "next/image";
import { UserInfo } from "./UserInfo";

export function PageHeader(): React.ReactElement {
  return (
    <div className="border-b border-[var(--secundary)] px-6 py-3">
    <div className="flex items-center justify-between">
      <a
        href="https://linkinvests.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo.svg"
          alt="LinkInvests Logo"
          width={20}
          height={20}
        />
      </a>
      <UserInfo />
    </div>
  </div>
  );
}