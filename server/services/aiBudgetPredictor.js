const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AIBudgetPredictor {
  constructor() {
    this.cityData = null;
    this.costModel = null;
    this.seasonalFactors = {};
    this.touristDensityFactors = {};
  }

  async initialize() {
    console.log('🤖 Initializing AI Budget Predictor...');
    
    // Load city data from database
    await this.loadCityData();
    
    // Train the cost prediction model
    await this.trainCostModel();
    
    // Calculate seasonal and tourist density factors
    this.calculateSeasonalFactors();
    this.calculateTouristDensityFactors();
    
    console.log('✅ AI Budget Predictor initialized successfully!');
  }

  // Load city data from database
  async loadCityData() {
    try {
      const cities = await prisma.city.findMany({
        include: {
          activities: true
        }
      });
      
      this.cityData = cities.reduce((acc, city) => {
        acc[city.name.toLowerCase()] = {
          ...city,
          activities: city.activities || []
        };
        return acc;
      }, {});
      
      console.log(`📊 Loaded data for ${cities.length} cities`);
    } catch (error) {
      console.error('Error loading city data:', error);
      throw error;
    }
  }

  // Train cost prediction model using seed data
  async trainCostModel() {
    console.log('🧠 Training cost prediction model...');
    
    // Extract features from city data
    const trainingData = Object.values(this.cityData).map(city => ({
      costIndex: city.costIndex || 100,
      popularity: city.popularity || 50,
      averageDailyCost: city.averageDailyCost || 100,
      region: city.region || 'Unknown',
      activityCount: city.activities.length,
      avgActivityCost: city.activities.length > 0 
        ? city.activities.reduce((sum, act) => sum + (act.cost || 0), 0) / city.activities.length 
        : 0
    }));

    // Simple linear regression model for cost prediction
    this.costModel = this.trainLinearRegression(trainingData);
    
    console.log('✅ Cost prediction model trained successfully!');
  }

  // Simple linear regression training
  trainLinearRegression(data) {
    // Features: costIndex, popularity, activityCount, avgActivityCost
    // Target: averageDailyCost
    
    const features = data.map(d => [d.costIndex, d.popularity, d.activityCount, d.avgActivityCost]);
    const targets = data.map(d => d.averageDailyCost);
    
    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Simple gradient descent for linear regression
    const weights = this.gradientDescent(normalizedFeatures, targets, 0.01, 1000);
    
    return {
      weights,
      featureMeans: this.calculateFeatureMeans(features),
      featureStds: this.calculateFeatureStds(features)
    };
  }

  // Normalize features for better training
  normalizeFeatures(features) {
    const means = this.calculateFeatureMeans(features);
    const stds = this.calculateFeatureStds(features);
    
    return features.map(feature => 
      feature.map((val, i) => (val - means[i]) / (stds[i] || 1))
    );
  }

  calculateFeatureMeans(features) {
    const numFeatures = features[0].length;
    const means = new Array(numFeatures).fill(0);
    
    features.forEach(feature => {
      feature.forEach((val, i) => {
        means[i] += val;
      });
    });
    
    return means.map(sum => sum / features.length);
  }

  calculateFeatureStds(features) {
    const means = this.calculateFeatureMeans(features);
    const numFeatures = features[0].length;
    const variances = new Array(numFeatures).fill(0);
    
    features.forEach(feature => {
      feature.forEach((val, i) => {
        variances[i] += Math.pow(val - means[i], 2);
      });
    });
    
    return variances.map(variance => Math.sqrt(variance / features.length));
  }

  // Gradient descent for linear regression
  gradientDescent(features, targets, learningRate, iterations) {
    const numFeatures = features[0].length;
    const numSamples = features.length;
    let weights = new Array(numFeatures).fill(0);
    let bias = 0;
    
    for (let iter = 0; iter < iterations; iter++) {
      let weightGradients = new Array(numFeatures).fill(0);
      let biasGradient = 0;
      
      // Calculate gradients
      for (let i = 0; i < numSamples; i++) {
        const prediction = this.predict(features[i], weights, bias);
        const error = prediction - targets[i];
        
        // Update gradients
        features[i].forEach((feature, j) => {
          weightGradients[j] += error * feature;
        });
        biasGradient += error;
      }
      
      // Update weights and bias
      weights = weights.map((weight, i) => 
        weight - (learningRate * weightGradients[i] / numSamples)
      );
      bias -= learningRate * biasGradient / numSamples;
    }
    
    return { weights, bias };
  }

  // Make prediction using trained model
  predict(features, weights, bias) {
    let prediction = bias;
    features.forEach((feature, i) => {
      prediction += feature * weights[i];
    });
    return Math.max(0, prediction); // Ensure non-negative
  }

  // Calculate seasonal factors based on travel patterns
  calculateSeasonalFactors() {
    // Peak seasons: Summer (Jun-Aug), Holiday season (Dec), Spring break (Mar-Apr)
    this.seasonalFactors = {
      0: 1.1,   // January - post-holiday dip
      1: 0.9,   // February - low season
      2: 1.0,   // March - spring break
      3: 1.2,   // April - spring break
      4: 1.1,   // May - shoulder season
      5: 1.3,   // June - summer peak
      6: 1.4,   // July - summer peak
      7: 1.4,   // August - summer peak
      8: 1.2,   // September - shoulder season
      9: 1.0,   // October - fall
      10: 0.9,  // November - low season
      11: 1.3   // December - holiday season
    };
  }

  // Calculate tourist density factors based on popularity
  calculateTouristDensityFactors() {
    // Higher popularity = higher prices due to demand
    this.touristDensityFactors = {
      low: 0.7,      // Popularity 0-30
      medium: 1.0,   // Popularity 31-70
      high: 1.3,     // Popularity 71-90
      veryHigh: 1.6  // Popularity 91-100
    };
  }

  // Get tourist density category
  getTouristDensityCategory(popularity) {
    if (popularity <= 30) return 'low';
    if (popularity <= 70) return 'medium';
    if (popularity <= 90) return 'high';
    return 'veryHigh';
  }

  // Predict budget breakdown for a trip
  async predictBudgetBreakdown(trip) {
    try {
      const cityName = trip.destinationCity.toLowerCase();
      const cityData = this.cityData[cityName];
      
      if (!cityData) {
        throw new Error(`City data not found for ${trip.destinationCity}`);
      }

      const tripDuration = this.calculateTripDuration(trip.startDate, trip.endDate);
      const startMonth = new Date(trip.startDate).getMonth();
      const seasonalFactor = this.seasonalFactors[startMonth] || 1.0;
      const touristDensityFactor = this.touristDensityFactors[
        this.getTouristDensityCategory(cityData.popularity || 50)
      ];

      // Base daily cost prediction using ML model
      const baseDailyCost = this.predictDailyCost(cityData);
      
      // Apply seasonal and tourist density adjustments
      const adjustedDailyCost = baseDailyCost * seasonalFactor * touristDensityFactor;

      // Calculate category breakdowns
      const breakdown = {
        accommodation: this.predictAccommodationCost(cityData, tripDuration, seasonalFactor, touristDensityFactor),
        transport: this.predictTransportCost(cityData, tripDuration, touristDensityFactor),
        activities: this.predictActivitiesCost(cityData, tripDuration, touristDensityFactor),
        meals: this.predictMealsCost(cityData, tripDuration, touristDensityFactor),
        other: this.predictOtherCosts(cityData, tripDuration, touristDensityFactor)
      };

      const totalPredicted = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);

      return {
        breakdown,
        totalPredicted,
        dailyAverage: adjustedDailyCost,
        confidence: this.calculateConfidence(cityData),
        insights: this.generateInsights(cityData, seasonalFactor, touristDensityFactor),
        recommendations: this.generateRecommendations(cityData, tripDuration, totalPredicted),
        marketFactors: {
          seasonalFactor,
          touristDensityFactor,
          costIndex: cityData.costIndex,
          popularity: cityData.popularity
        }
      };

    } catch (error) {
      console.error('Error predicting budget:', error);
      throw error;
    }
  }

  // Predict daily cost using ML model
  predictDailyCost(cityData) {
    const features = [
      cityData.costIndex || 100,
      cityData.popularity || 50,
      cityData.activities.length,
      cityData.activities.length > 0 
        ? cityData.activities.reduce((sum, act) => sum + (act.cost || 0), 0) / cityData.activities.length 
        : 0
    ];

    // Normalize features
    const normalizedFeatures = features.map((val, i) => 
      (val - this.costModel.featureMeans[i]) / (this.costModel.featureStds[i] || 1)
    );

    // Make prediction
    return this.predict(normalizedFeatures, this.costModel.weights, this.costModel.bias);
  }

  // Predict accommodation costs
  predictAccommodationCost(cityData, duration, seasonalFactor, touristDensityFactor) {
    const baseCost = (cityData.averageDailyCost || 100) * 0.4; // 40% of daily cost
    return baseCost * duration * seasonalFactor * touristDensityFactor;
  }

  // Predict transport costs
  predictTransportCost(cityData, duration, touristDensityFactor) {
    const baseCost = (cityData.averageDailyCost || 100) * 0.25; // 25% of daily cost
    return baseCost * duration * touristDensityFactor;
  }

  // Predict activities costs
  predictActivitiesCost(cityData, duration, touristDensityFactor) {
    const avgActivityCost = cityData.activities.length > 0 
      ? cityData.activities.reduce((sum, act) => sum + (act.cost || 0), 0) / cityData.activities.length 
      : 30;
    
    const activitiesPerDay = Math.min(2, cityData.activities.length / 7); // Max 2 activities per day
    return avgActivityCost * activitiesPerDay * duration * touristDensityFactor;
  }

  // Predict meals costs
  predictMealsCost(cityData, duration, touristDensityFactor) {
    const baseCost = (cityData.averageDailyCost || 100) * 0.25; // 25% of daily cost
    return baseCost * duration * touristDensityFactor;
  }

  // Predict other costs
  predictOtherCosts(cityData, duration, touristDensityFactor) {
    const baseCost = (cityData.averageDailyCost || 100) * 0.1; // 10% of daily cost
    return baseCost * duration * touristDensityFactor;
  }

  // Calculate prediction confidence
  calculateConfidence(cityData) {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on data quality
    if (cityData.costIndex && cityData.popularity && cityData.averageDailyCost) {
      confidence += 0.1;
    }
    
    if (cityData.activities.length > 5) {
      confidence += 0.05;
    }
    
    return Math.min(0.95, confidence);
  }

  // Generate insights based on city data
  generateInsights(cityData, seasonalFactor, touristDensityFactor) {
    const insights = [];
    
    if (seasonalFactor > 1.2) {
      insights.push(`Peak season pricing - costs are ${Math.round((seasonalFactor - 1) * 100)}% higher than average`);
    } else if (seasonalFactor < 0.9) {
      insights.push(`Off-season pricing - costs are ${Math.round((1 - seasonalFactor) * 100)}% lower than average`);
    }
    
    if (touristDensityFactor > 1.2) {
      insights.push(`High tourist demand area - prices reflect premium market conditions`);
    }
    
    if (cityData.costIndex > 120) {
      insights.push(`High cost of living destination - consider budget-friendly alternatives`);
    } else if (cityData.costIndex < 80) {
      insights.push(`Budget-friendly destination - good value for money`);
    }
    
    return insights;
  }

  // Generate recommendations
  generateRecommendations(cityData, duration, totalPredicted) {
    const recommendations = [];
    
    if (duration > 7) {
      recommendations.push('Consider weekly passes for transport and attractions');
      recommendations.push('Look for long-term accommodation discounts');
    }
    
    if (cityData.activities.length > 10) {
      recommendations.push('Purchase city passes for multiple attractions');
    }
    
    if (cityData.costIndex > 100) {
      recommendations.push('Book activities and accommodation in advance for better rates');
      recommendations.push('Consider alternative accommodations like hostels or Airbnb');
    }
    
    return recommendations;
  }

  // Calculate trip duration in days
  calculateTripDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  }

  // Get city statistics for analysis
  async getCityStatistics(cityName) {
    const cityData = this.cityData[cityName.toLowerCase()];
    if (!cityData) return null;

    return {
      name: cityData.name,
      country: cityData.country,
      costIndex: cityData.costIndex,
      popularity: cityData.popularity,
      averageDailyCost: cityData.averageDailyCost,
      currency: cityData.currency,
      activityCount: cityData.activities.length,
      avgActivityCost: cityData.activities.length > 0 
        ? cityData.activities.reduce((sum, act) => sum + (act.cost || 0), 0) / cityData.activities.length 
        : 0,
      topActivities: cityData.activities
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)
    };
  }

  // Get cost comparison between cities
  async compareCities(cityNames) {
    const comparisons = [];
    
    for (const cityName of cityNames) {
      const cityData = this.cityData[cityName.toLowerCase()];
      if (cityData) {
        comparisons.push({
          name: cityData.name,
          costIndex: cityData.costIndex,
          popularity: cityData.popularity,
          averageDailyCost: cityData.averageDailyCost,
          touristDensity: this.getTouristDensityCategory(cityData.popularity || 50)
        });
      }
    }
    
    return comparisons.sort((a, b) => a.averageDailyCost - b.averageDailyCost);
  }
}

module.exports = AIBudgetPredictor;
