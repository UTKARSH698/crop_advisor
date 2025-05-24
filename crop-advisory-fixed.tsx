import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Calendar, Sprout, AlertTriangle, CheckCircle, Info, MapPin } from 'lucide-react';

const CropAdvisorySystem = () => {
  const [location, setLocation] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);

  // For demo purposes - using mock data instead of API
  const DEMO_MODE = true;

  // Mock weather data for demonstration
  const mockWeatherData = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    rainfall: 2.5,
    condition: 'partly-cloudy',
    description: 'partly cloudy',
    pressure: 1013,
    visibility: 10
  };

  const mockForecastData = [
    { day: 'Today', date: '2025-05-23', temp: 24, humidity: 65, rainfall: 2.5, condition: 'partly-cloudy', description: 'partly cloudy' },
    { day: 'Tomorrow', date: '2025-05-24', temp: 26, humidity: 70, rainfall: 0, condition: 'sunny', description: 'clear sky' },
    { day: 'Day 3', date: '2025-05-25', temp: 22, humidity: 80, rainfall: 15, condition: 'rain', description: 'moderate rain' },
    { day: 'Day 4', date: '2025-05-26', temp: 20, humidity: 75, rainfall: 8, condition: 'light-rain', description: 'light rain' },
    { day: 'Day 5', date: '2025-05-27', temp: 25, humidity: 60, rainfall: 0, condition: 'sunny', description: 'clear sky' }
  ];

  const crops = {
    'rice': {
      name: 'Rice',
      optimalTemp: [20, 35],
      optimalHumidity: [60, 80],
      waterRequirement: 'high',
      growthStages: ['seedling', 'tillering', 'flowering', 'maturity'],
      plantingMonths: [5, 6, 7],
      harvestMonths: [10, 11, 12]
    },
    'wheat': {
      name: 'Wheat',
      optimalTemp: [15, 25],
      optimalHumidity: [40, 70],
      waterRequirement: 'medium',
      growthStages: ['germination', 'tillering', 'heading', 'maturity'],
      plantingMonths: [11, 12, 1],
      harvestMonths: [4, 5]
    },
    'corn': {
      name: 'Corn/Maize',
      optimalTemp: [18, 30],
      optimalHumidity: [50, 75],
      waterRequirement: 'high',
      growthStages: ['emergence', 'vegetative', 'reproductive', 'maturity'],
      plantingMonths: [3, 4, 5],
      harvestMonths: [8, 9, 10]
    },
    'tomato': {
      name: 'Tomato',
      optimalTemp: [18, 26],
      optimalHumidity: [60, 80],
      waterRequirement: 'medium',
      growthStages: ['seedling', 'flowering', 'fruiting', 'harvest'],
      plantingMonths: [2, 3, 4, 9, 10],
      harvestMonths: [5, 6, 7, 12, 1]
    }
  };

  const generateRecommendations = (weather, crop) => {
    const recommendations = [];
    const currentMonth = new Date().getMonth() + 1;
    
    if (!crop) return recommendations;

    // Temperature recommendations
    const temp = weather.current.temperature;
    if (temp < crop.optimalTemp[0]) {
      recommendations.push({
        type: 'warning',
        category: 'Temperature',
        message: `Temperature (${temp}°C) is below optimal range (${crop.optimalTemp[0]}°C - ${crop.optimalTemp[1]}°C). Consider using row covers or greenhouses.`,
        action: 'Protect crops from cold stress'
      });
    } else if (temp > crop.optimalTemp[1]) {
      recommendations.push({
        type: 'warning',
        category: 'Temperature',
        message: `Temperature (${temp}°C) is above optimal range (${crop.optimalTemp[0]}°C - ${crop.optimalTemp[1]}°C). Increase irrigation and provide shade.`,
        action: 'Implement cooling measures'
      });
    } else {
      recommendations.push({
        type: 'success',
        category: 'Temperature',
        message: `Temperature (${temp}°C) is optimal for ${crop.name}.`,
        action: 'Continue current practices'
      });
    }

    // Humidity recommendations
    const humidity = weather.current.humidity;
    if (humidity < crop.optimalHumidity[0]) {
      recommendations.push({
        type: 'warning',
        category: 'Humidity',
        message: `Humidity (${humidity}%) is below optimal range (${crop.optimalHumidity[0]}% - ${crop.optimalHumidity[1]}%). Increase irrigation frequency.`,
        action: 'Monitor soil moisture closely'
      });
    } else if (humidity > crop.optimalHumidity[1]) {
      recommendations.push({
        type: 'warning',
        category: 'Humidity',
        message: `Humidity (${humidity}%) is above optimal range (${crop.optimalHumidity[0]}% - ${crop.optimalHumidity[1]}%). Ensure good ventilation and watch for fungal diseases.`,
        action: 'Improve air circulation'
      });
    } else {
      recommendations.push({
        type: 'success',
        category: 'Humidity',
        message: `Humidity (${humidity}%) is optimal for ${crop.name}.`,
        action: 'Continue current practices'
      });
    }

    // Rainfall recommendations
    const upcomingRain = weather.forecast.slice(1, 4).reduce((sum, day) => sum + day.rainfall, 0);
    if (upcomingRain > 30) {
      recommendations.push({
        type: 'info',
        category: 'Irrigation',
        message: `Heavy rainfall expected (${upcomingRain.toFixed(1)}mm). Reduce irrigation and ensure drainage.`,
        action: 'Prepare for excess water management'
      });
    } else if (upcomingRain < 5 && crop.waterRequirement === 'high') {
      recommendations.push({
        type: 'warning',
        category: 'Irrigation',
        message: `Low rainfall expected (${upcomingRain.toFixed(1)}mm). Increase irrigation for water-intensive ${crop.name}.`,
        action: 'Plan additional watering schedule'
      });
    } else {
      recommendations.push({
        type: 'info',
        category: 'Irrigation',
        message: `Expected rainfall (${upcomingRain.toFixed(1)}mm) is adequate for ${crop.name}.`,
        action: 'Monitor soil moisture regularly'
      });
    }

    // Planting time recommendations
    if (crop.plantingMonths.includes(currentMonth)) {
      recommendations.push({
        type: 'success',
        category: 'Planting',
        message: `This is an optimal month for planting ${crop.name}.`,
        action: 'Consider starting new plantings'
      });
    }

    // Harvest time recommendations
    if (crop.harvestMonths.includes(currentMonth)) {
      recommendations.push({
        type: 'info',
        category: 'Harvest',
        message: `This is harvest season for ${crop.name}. Monitor crop maturity.`,
        action: 'Prepare for harvesting activities'
      });
    }

    // Pest and disease warnings based on weather
    if (humidity > 80 && temp > 20) {
      recommendations.push({
        type: 'warning',
        category: 'Disease Risk',
        message: `High humidity (${humidity}%) and temperature (${temp}°C) favor fungal diseases.`,
        action: 'Apply preventive fungicide treatments'
      });
    }

    return recommendations;
  };

  const handleAnalyze = () => {
    if (!location || !selectedCrop) {
      setError('Please enter a location and select a crop');
      return;
    }
    
    fetchWeatherData(location);
  };

  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter' && location && selectedCrop) {
      handleAnalyze();
    }
  };

  const fetchWeatherData = async (locationName) => {
    try {
      setError('');
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (DEMO_MODE) {
        // Use mock data for demonstration
        setLocationData({
          name: locationName,
          country: 'Demo',
          state: ''
        });
        
        setCurrentWeather(mockWeatherData);
        setForecast(mockForecastData);

        if (selectedCrop) {
          const recs = generateRecommendations(
            { current: mockWeatherData, forecast: mockForecastData }, 
            crops[selectedCrop]
          );
          setRecommendations(recs);
        }
      } else {
        // Real API implementation would go here
        throw new Error('API integration not configured for this demo');
      }

    } catch (err) {
      setError(err.message);
      setCurrentWeather(null);
      setForecast([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'partly-cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-600" />;
      case 'rain': return <CloudRain className="w-6 h-6 text-blue-600" />;
      case 'light-rain': return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'thunderstorm': return <CloudRain className="w-6 h-6 text-purple-600" />;
      case 'snow': return <Cloud className="w-6 h-6 text-blue-200" />;
      case 'fog': return <Cloud className="w-6 h-6 text-gray-400" />;
      default: return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Sprout className="text-green-600" />
            Crop Advisory System
          </h1>
          <p className="text-gray-600 text-lg">AI-powered farming recommendations based on weather conditions</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {DEMO_MODE && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Info className="w-5 h-5" />
                <span className="font-medium">Demo Mode</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                This is a demonstration using mock weather data. Enter any location name to see how the system works.
              </p>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleLocationKeyPress}
                placeholder="Enter city name (e.g., London, New York)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a crop</option>
                {Object.entries(crops).map(([key, crop]) => (
                  <option key={key} value={key}>{crop.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleAnalyze}
                disabled={!location || !selectedCrop || loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {currentWeather && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weather Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Thermometer className="text-red-500" />
                  Current Weather
                </h2>
                {locationData && (
                  <div className="text-sm text-gray-600">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {locationData.name}, {locationData.state} {locationData.country}
                  </div>
                )}
              </div>
              
              {currentWeather.description && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(currentWeather.condition)}
                    <span className="font-medium capitalize">{currentWeather.description}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{currentWeather.temperature}°C</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{currentWeather.humidity}%</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Wind Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{currentWeather.windSpeed} km/h</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Rainfall</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{currentWeather.rainfall}mm</p>
                </div>
              </div>

              {/* 5-Day Forecast */}
              <h3 className="text-lg font-semibold text-gray-800 mb-3">5-Day Forecast</h3>
              <div className="space-y-2">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.condition)}
                      <div>
                        <span className="font-medium">{day.day}</span>
                        <div className="text-xs text-gray-500 capitalize">{day.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">{day.temp}°C</span>
                      <span className="text-blue-600">{day.humidity}%</span>
                      <span className="text-blue-700">{day.rainfall}mm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-green-500" />
                Recommendations
              </h2>
              
              {selectedCrop && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Selected Crop: {crops[selectedCrop].name}
                  </h3>
                  <div className="text-sm text-green-700">
                    <p>Optimal Temperature: {crops[selectedCrop].optimalTemp[0]}°C - {crops[selectedCrop].optimalTemp[1]}°C</p>
                    <p>Optimal Humidity: {crops[selectedCrop].optimalHumidity[0]}% - {crops[selectedCrop].optimalHumidity[1]}%</p>
                    <p>Water Requirement: {crops[selectedCrop].waterRequirement}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'success' ? 'bg-green-50 border-green-500' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{rec.category}</h4>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.message}</p>
                        <p className="text-sm font-medium text-gray-600">
                          Action: {rec.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {recommendations.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Sprout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a location and crop to get personalized recommendations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing weather data and generating recommendations...</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>{DEMO_MODE ? 'Demo mode with mock weather data' : 'Real-time weather data powered by OpenWeatherMap API'}</p>
          <p className="mt-1">For production use, ensure you have a valid API key and handle rate limits appropriately.</p>
        </div>
      </div>
    </div>
  );
};

export default CropAdvisorySystem;