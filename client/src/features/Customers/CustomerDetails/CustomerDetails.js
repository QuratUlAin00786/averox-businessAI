import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomerSuccess } from '../customerSlice';
import { customerService } from '../../../services/customerService';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';

const CustomerDetails = () => {
  const dispatch = useDispatch();
  const { selectedCustomer } = useSelector((state) => state.customers);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);

  if (!selectedCustomer) {
    return <div>No customer selected</div>;
  }

  const handleEditClick = () => {
    setFormData({ ...selectedCustomer });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveChanges = async () => {
    try {
      const updatedCustomer = await customerService.updateCustomer(selectedCustomer.id, formData);
      dispatch(updateCustomerSuccess(updatedCustomer));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
      // Show error message
    }
  };

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await customerService.deleteCustomer(selectedCustomer.id);
      dispatch({ type: 'customers/deleteCustomerSuccess', payload: selectedCustomer.id });
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      // Show error message
    }
  };

  return (
    <div className="customer-details">
      <h2>Customer Details</h2>
      
      {isEditing ? (
        // Edit Form
        <div className="customer-edit-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <Button onClick={handleSaveChanges} className="btn-primary">
              Save Changes
            </Button>
            <Button onClick={handleCancelEdit} className="btn-secondary">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Display View
        <div className="customer-info">
          <div className="info-row">
            <strong>Name:</strong> {selectedCustomer.name}
          </div>
          <div className="info-row">
            <strong>Email:</strong> {selectedCustomer.email}
          </div>
          <div className="info-row">
            <strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}
          </div>
          <div className="info-row">
            <strong>Created:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}
          </div>
          <div className="customer-actions">
            <Button onClick={handleEditClick} className="btn-primary">
              Edit
            </Button>
            <Button onClick={handleDeleteClick} className="btn-danger">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <Modal
          title="Confirm Delete"
          onClose={() => setShowModal(false)}
        >
          <div>
            <p>Are you sure you want to delete {selectedCustomer.name}?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <Button onClick={handleConfirmDelete} className="btn-danger">
                Delete
              </Button>
              <Button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDetails;