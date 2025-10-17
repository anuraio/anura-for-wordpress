import {
  Modal,
  Button,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
  __experimentalText as Text,
} from "@wordpress/components";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDestructive = variant === "destructive";

  return (
    <Modal
      title={title}
      onRequestClose={onCancel}
      className="confirm-modal"
      style={{ maxWidth: "400px" }}
    >
      <VStack spacing={4} style={{ minWidth: "350px" }}>
        {/* Icon and Message */}
        <div style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          gap: "12px",
          padding: "0px 0"
        }}>
          {isDestructive && (
            <AlertTriangle 
              size={24} 
              style={{ 
                color: "#d63638", 
                flexShrink: 0,
                marginTop: "2px"
              }} 
            />
          )}
          <Text
            style={{ 
              fontSize: "14px", 
              lineHeight: "1.5",
              color: "#1d2327"
            }}
          >
            {message}
          </Text>
        </div>

        {/* Action Buttons */}
        <HStack
          justify="flex-end"
          spacing={3}
          style={{
            marginTop: "8px",
            paddingTop: "16px",
            borderTop: "1px solid #ddd",
            width: "100%"
          }}
        >
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "primary" : "primary"}
            onClick={onConfirm}
            style={isDestructive ? {
              backgroundColor: "#d63638",
              borderColor: "#d63638"
            } : undefined}
          >
            {confirmText}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}