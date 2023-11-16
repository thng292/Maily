type STATResult = {
  id: number;
  size: number;
};

type UIDLResult = {
  id: number;
  uid: string;
};

class POP3Wrapper {
  constructor() {
    //Co loi thi throw nha
  }

  STAT(): STATResult[] {
    return [];
  }

  UIDL(msgNumber: number | null): UIDLResult[] {
    return [];
  }

  RETR(msgNumber: number): string | null {
    return "";
  }

  DELE(msgNumber: number): boolean {
    return true;
  }
}

class SMTPWrapper {
  constructor() {
    //Co loi thi throw nha
  }

  send(from: string, to: string[], content: string): boolean {
    return true;
  }
}

export { POP3Wrapper, SMTPWrapper };
export type { STATResult, UIDLResult };
