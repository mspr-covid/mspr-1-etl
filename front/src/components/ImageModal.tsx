"use client";

import React from "react";

type ImageModalProps = {
	url: string;
	title: string;
	onClose: () => void;
};

const ImageModal: React.FC<ImageModalProps> = ({ url, title, onClose }) => {
	return (
		<div
			className="modal fade show d-block"
			tabIndex={-1}
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-xl modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header border-0">
						<h5 className="modal-title text-primary fw-semibold">
							<i className="bi bi-graph-up me-2"></i>
							{title}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body p-0">
						<img
							src={url || "/placeholder.svg"}
							alt={title}
							className="img-fluid w-100"
							style={{ maxHeight: "80vh", objectFit: "contain" }}
						/>
					</div>
					<div className="modal-footer border-0 justify-content-center">
						<button
							type="button"
							className="btn btn-outline-primary rounded-pill px-4"
							onClick={onClose}
						>
							<i className="bi bi-x-lg me-2"></i>
							Fermer
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImageModal;
