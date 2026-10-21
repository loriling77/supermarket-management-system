import { useState } from "react";

interface RecordActionsProps {
    name: string;
    onUpdate: () => void;
    onDelete: () => Promise<void>;
}

export default function RecordActions({ name, onUpdate, onDelete }: RecordActionsProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (deleting || !window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
        setError("");
        setDeleting(true);
        try {
            await onDelete();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to delete this record. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="record-actions-container">
            <div className="record-actions">
                <button type="button" className="select-btn" aria-label={`Update ${name}`} disabled={deleting} onClick={onUpdate}>Update</button>
                <button type="button" className="record-delete-btn" aria-label={`Delete ${name}`} disabled={deleting} onClick={() => void handleDelete()}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
            {error && <p className="record-action-error" role="alert">{error}</p>}
        </div>
    );
}
