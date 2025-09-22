import React from "react";
import ReportForm from "./components/ReportForm";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Sahaay</h1>
        <p className="text-gray-500">
          Crowdsource civic reporting: capture a photo + voice note in one tap.
        </p>
        <ReportForm />
      </div>
    </div>
  );
}

export default App;
