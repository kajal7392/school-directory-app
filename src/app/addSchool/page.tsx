'use client';

import { useForm } from 'react-hook-form';
import styles from './page.module.css';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Image from 'next/image';


interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image: FileList;
}

export default function AddSchool() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SchoolFormData>();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: SchoolFormData) => {
    setSubmitError(null);

    if (!data.image || data.image.length === 0) {
      setSubmitError('Please select an image for the school');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('contact', data.contact);
    formData.append('email_id', data.email_id);
    formData.append('image', data.image[0]);

    try {
      const response = await fetch('/api/add-school', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        alert('School added successfully!');
        reset();
        setPreviewImage(null);
      } else {
        setSubmitError(result.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Failed to submit form.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Add a New School</h1>
        <form
          className={styles.formWrapper}
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <div className={styles.formGrid}>
            {/* School Name Field */}
            <div>
              <label htmlFor="name" className={styles.label}>
                School Name *
              </label>
              <input
                type="text"
                id="name"
                className={styles.inputField}
                {...register('name', { 
                  required: 'School name is required',
                  minLength: {
                    value: 2,
                    message: 'School name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'School name must be less than 100 characters'
                  }
                })}
                placeholder="Enter school name"
              />
              <p className={styles.error}>{errors.name?.message}</p>
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className={styles.label}>
                Address *
              </label>
              <input
                type="text"
                id="address"
                className={styles.inputField}
                {...register('address', { 
                  required: 'Address is required',
                  minLength: {
                    value: 5,
                    message: 'Address must be at least 5 characters'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Address must be less than 200 characters'
                  }
                })}
                placeholder="Enter full address"
              />
              <p className={styles.error}>{errors.address?.message}</p>
            </div>

            {/* City Field */}
            <div>
              <label htmlFor="city" className={styles.label}>
                City *
              </label>
              <input
                type="text"
                id="city"
                className={styles.inputField}
                {...register('city', { 
                  required: 'City is required',
                  minLength: {
                    value: 2,
                    message: 'City name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'City name must be less than 50 characters'
                  }
                })}
                placeholder="Enter city"
              />
              <p className={styles.error}>{errors.city?.message}</p>
            </div>

            {/* State Field */}
            <div>
              <label htmlFor="state" className={styles.label}>
                State *
              </label>
              <input
                type="text"
                id="state"
                className={styles.inputField}
                {...register('state', { 
                  required: 'State is required',
                  minLength: {
                    value: 2,
                    message: 'State name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'State name must be less than 50 characters'
                  }
                })}
                placeholder="Enter state"
              />
              <p className={styles.error}>{errors.state?.message}</p>
            </div>

            {/* Contact Number Field */}
            <div>
              <label htmlFor="contact" className={styles.label}>
                Contact Number *
              </label>
              <input
                type="tel"
                id="contact"
                className={styles.inputField}
                {...register('contact', {
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number',
                  },
                  minLength: {
                    value: 10,
                    message: 'Contact number must be at least 10 digits'
                  },
                  maxLength: {
                    value: 15,
                    message: 'Contact number must be less than 15 digits'
                  }
                })}
                placeholder="Enter contact number"
              />
              <p className={styles.error}>{errors.contact?.message}</p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email_id" className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                id="email_id"
                className={styles.inputField}
                {...register('email_id', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  }
                })}
                placeholder="Enter email address"
              />
              <p className={styles.error}>{errors.email_id?.message}</p>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className={styles.imageSection}>
            <label htmlFor="image" className={styles.label}>
              School Image *
            </label>
            <input
              type="file"
              id="image"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              className={styles.fileInput}
              {...register('image', {
                required: 'School image is required',
                onChange: handleImageChange,
                validate: {
                  fileType: (files) => {
                    if (!files || files.length === 0) return true;
                    const file = files[0];
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                    return allowedTypes.includes(file.type) || 'Only JPG, PNG, WEBP, and GIF images are allowed';
                  },
                  fileSize: (files) => {
                    if (!files || files.length === 0) return true;
                    const file = files[0];
                    const maxSize = 5 * 1024 * 1024;
                    return file.size <= maxSize || 'Image size must be less than 5MB';
                  },
                },
              })}
            />
            <p className={styles.error}>{errors.image?.message}</p>

          {previewImage && (
            <div className={styles.imagePreview}>
              <Image
                src={previewImage}
                alt="School preview"
                width={500}     
                height={300}   
                className={styles.imagePreviewImg} 
              />
              <p className={styles.imageNote}>Image Preview</p>
            </div>
          )}

          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span> 
                Adding School...
              </>
            ) : (
              'Add School'
            )}
          </button>

          {/* Submit Error Message */}
          {submitError && (
            <div className={styles.submitError}>
              ⚠️ {submitError}
            </div>
          )}
        </form>
      </div>
    </ProtectedRoute>
  );
}