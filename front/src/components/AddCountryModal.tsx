import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AddCountryForm from "../components/AddCountryForm";

interface AddCountryModalProps {
	show: boolean;
	onHide: () => void;
}

const AddCountryModal = ({ show, onHide }: AddCountryModalProps) => {
	const { t } = useTranslation();

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>{t("manage.add")}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<AddCountryForm />
			</Modal.Body>
		</Modal>
	);
};

export default AddCountryModal;
