import React from "react";

function FooterForAssistance() {
  return (
     <footer className="bg-gray-900 text-gray-300 py-2 border-t border-gray-700 absolute left-0 right-0 bottom-0">
      <div className="text-center text-sm sm:text-base">
        Kenkoo Assistant can make mistakes.{" "}
        <span className="cursor-pointer hover:text-white">
          Check important info.
        </span>{" "}
        <span className="underline cursor-pointer hover:text-white">
          See Cookie preferences.
        </span>
      </div>
    </footer>
  );
}

export default FooterForAssistance;
