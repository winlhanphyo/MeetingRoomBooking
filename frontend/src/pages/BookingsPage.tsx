import React from 'react';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

export default function BookingsPage(): React.ReactElement {
  return (
    <>
      <BookingForm />
      <BookingList />
    </>
  );
}
