import React from "react";
import { Language } from "../types"; // Ensure this path is correct
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BookingForm: React.FC<{ languages?: Language[] }> = ({
  languages = [],
}) => {
  // Ensure languages is always an array
  const { data: languagesData = [], isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await axios.get("/api/languages");
      console.log(response.data);
      return response.data; // Ensure this is an array
    },
  });

  // Handle loading state
  if (isLoading) {
    return <div>Loading languages...</div>;
  }

  return (
    <div>
      {Array.isArray(languagesData) && languagesData.length > 0 ? (
        languagesData.map((language) => (
          <div key={language.id}>{language.name}</div>
        ))
      ) : (
        <div>No languages available</div>
      )}
    </div>
  );
};

export default BookingForm;
