export default function Home() {
  const latitude = 40.7128;
  const longitude = -74.006;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-74.026675,40.682916,-73.910408,40.879038&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text p-16 px-36">
      {/* Flexbox container for the map and content */}
      <div className="flex flex-col md:flex-row justify-center items-start md:space-x-8">
        
        {/* Map Section */}
        <div className="mb-8 md:mb-0 md:mr-8 w-full md:w-[400px]">
          <iframe
            src={mapUrl}
            width="100%"  
            height="350"
            style={{ border: 1 }}
            allowFullScreen
            loading="lazy"
            title="Static Map"
          ></iframe>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-start w-full md:w-1/2 p-12">
          {/* Date Picker Section */}
          <div className="mb-6 w-full">
            <label htmlFor="date-picker" className="block text-lg font-semibold mb-2">
              Pick a Date:
            </label>
            <input
              type="date"
              id="date-picker"
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Address Search Section */}
          <div className="mb-6 w-full">
            <label htmlFor="address-search" className="block text-lg font-semibold mb-2">
              Address:
            </label>
            <input
              type="text"
              id="address-search"
              placeholder="Enter address"
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Dummy Tags */}
          <div className="mt-4">
            <label className="block text-lg font-semibold mb-2">filters:</label>
            <span className="px-4 py-2 bg-gray-200 rounded-md text-sm mr-2">New York</span>
            <span className="px-4 py-2 bg-gray-200 rounded-md text-sm mr-2">Manhattan</span>
            <span className="px-4 py-2 bg-gray-200 rounded-md text-sm mr-2">Brooklyn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
