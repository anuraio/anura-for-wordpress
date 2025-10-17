import { Notice } from "@wordpress/components";

interface ErrorNoticeProps {
  error: string;
}

export function ErrorNotice({ error }: ErrorNoticeProps) {
  return (
    <Notice status="error" isDismissible={false}>
      {error}
    </Notice>
  );
}
