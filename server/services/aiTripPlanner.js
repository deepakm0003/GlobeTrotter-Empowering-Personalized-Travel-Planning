const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AITripPlanner {
  constructor() {
    this.preferences = {
      budget: { low: 0.3, medium: 0.5, high: 0.8 },
      duration: { short: 0.3, medium: 0.5, long: 0.8 },
      interests: {
        culture: 0.8,
        adventure: 0.7,
        food: 0.6,
        nature: 0.5,
        sightseeing: 0.9,
        relaxation: 0.4
      }
    };
  }

  // Analyze user preferences and create personalized trip recommendations
  async planTrip(userId, selectedCity, selectedActivities = [], tripDuration = 7) {
    try {
      // Get user profile and preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { trips: true }
      });

      // Get city information
      const city = await prisma.city.findUnique({
        where: { id: selectedCity },
        include: { activities: true }
      });

      if (!city) {
        throw new Error('City not found');
      }

      // Analyze user's travel history
      const travelHistory = await this.analyzeTravelHistory(userId);
      
      // Generate personalized recommendations
      const recommendations = await this.generateRecommendations(
        city,
        selectedActivities,
        travelHistory,
        tripDuration,
        user.preferences
      );

      // Create optimized itinerary
      const itinerary = this.createOptimizedItinerary(recommendations, tripDuration);

      // Calculate budget and costs
      const budgetAnalysis = this.calculateBudget(itinerary, city);

      return {
        city: city,
        itinerary: itinerary,
        budgetAnalysis: budgetAnalysis,
        recommendations: recommendations,
        travelInsights: travelHistory.insights
      };
    } catch (error) {
      console.error('AI Trip Planning Error:', error);
      throw error;
    }
  }

  // Analyze user's travel history to understand preferences
  async analyzeTravelHistory(userId) {
    const userTrips = await prisma.trip.findMany({
      where: { userId: userId },
      include: { budgetItems: true }
    });

    const insights = {
      preferredRegions: {},
      averageBudget: 0,
      tripDuration: 0,
      activityPreferences: {},
      seasonalPreferences: {}
    };

    if (userTrips.length > 0) {
      // Analyze preferred regions
      userTrips.forEach(trip => {
        const region = trip.destinationCountry;
        insights.preferredRegions[region] = (insights.preferredRegions[region] || 0) + 1;
      });

      // Calculate average budget
      const totalBudget = userTrips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0);
      insights.averageBudget = totalBudget / userTrips.length;

      // Calculate average trip duration
      const totalDuration = userTrips.reduce((sum, trip) => {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      insights.tripDuration = totalDuration / userTrips.length;

      // Analyze seasonal preferences
      userTrips.forEach(trip => {
        const month = new Date(trip.startDate).getMonth();
        const season = this.getSeason(month);
        insights.seasonalPreferences[season] = (insights.seasonalPreferences[season] || 0) + 1;
      });
    }

    return insights;
  }

  // Generate personalized activity recommendations
  async generateRecommendations(city, selectedActivities, travelHistory, tripDuration, userPreferences) {
    const allActivities = await prisma.activity.findMany({
      where: { cityId: city.id },
      include: { city: true }
    });

    // Score activities based on multiple factors
    const scoredActivities = allActivities.map(activity => {
      let score = 0;

      // Base popularity score
      score += (activity.rating || 0) * 0.3;

      // User preference alignment
      if (userPreferences && userPreferences.interests) {
        const categoryScore = this.preferences.interests[activity.category] || 0.5;
        score += categoryScore * 0.2;
      }

      // Budget alignment
      const budgetScore = this.calculateBudgetScore(activity.cost, travelHistory.averageBudget);
      score += budgetScore * 0.15;

      // Duration optimization
      const durationScore = this.calculateDurationScore(activity.duration, tripDuration);
      score += durationScore * 0.15;

      // Seasonal relevance
      const seasonalScore = this.calculateSeasonalScore(activity, travelHistory.seasonalPreferences);
      score += seasonalScore * 0.1;

      // Diversity score (avoid too many similar activities)
      const diversityScore = this.calculateDiversityScore(activity, selectedActivities);
      score += diversityScore * 0.1;

      return {
        ...activity,
        aiScore: score,
        recommendationReason: this.generateRecommendationReason(activity, score, travelHistory)
      };
    });

    // Sort by AI score and return top recommendations
    return scoredActivities
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, Math.min(tripDuration * 2, scoredActivities.length));
  }

  // Create optimized daily itinerary
  createOptimizedItinerary(recommendations, tripDuration) {
    const itinerary = [];
    const activitiesPerDay = Math.ceil(recommendations.length / tripDuration);

    for (let day = 1; day <= tripDuration; day++) {
      const dayActivities = recommendations.slice(
        (day - 1) * activitiesPerDay,
        day * activitiesPerDay
      );

      // Optimize daily schedule
      const optimizedDay = this.optimizeDailySchedule(dayActivities, day);
      
      itinerary.push({
        day: day,
        activities: optimizedDay,
        totalCost: optimizedDay.reduce((sum, activity) => sum + (activity.cost || 0), 0),
        totalDuration: optimizedDay.reduce((sum, activity) => sum + (activity.duration || 0), 0)
      });
    }

    return itinerary;
  }

  // Optimize daily schedule (morning, afternoon, evening)
  optimizeDailySchedule(activities, day) {
    const schedule = {
      morning: [],
      afternoon: [],
      evening: []
    };

    activities.forEach(activity => {
      const timeSlot = this.assignTimeSlot(activity, day);
      schedule[timeSlot].push(activity);
    });

    return {
      morning: schedule.morning,
      afternoon: schedule.afternoon,
      evening: schedule.evening
    };
  }

  // Assign activities to optimal time slots
  assignTimeSlot(activity, day) {
    const category = activity.category;
    
    // Cultural activities work well in morning
    if (['culture', 'sightseeing'].includes(category)) {
      return 'morning';
    }
    
    // Food activities in afternoon/evening
    if (category === 'food') {
      return Math.random() > 0.5 ? 'afternoon' : 'evening';
    }
    
    // Adventure activities in afternoon
    if (category === 'adventure') {
      return 'afternoon';
    }
    
    // Nature activities in morning
    if (category === 'nature') {
      return 'morning';
    }
    
    // Default distribution
    const rand = Math.random();
    if (rand < 0.4) return 'morning';
    if (rand < 0.7) return 'afternoon';
    return 'evening';
  }

  // Calculate budget analysis
  calculateBudget(itinerary, city) {
    const totalCost = itinerary.reduce((sum, day) => sum + day.totalCost, 0);
    const accommodationCost = city.averageDailyCost * itinerary.length;
    const transportationCost = this.estimateTransportationCost(city, itinerary.length);
    const foodCost = this.estimateFoodCost(city, itinerary.length);
    const miscellaneousCost = totalCost * 0.2; // 20% buffer

    return {
      activities: totalCost,
      accommodation: accommodationCost,
      transportation: transportationCost,
      food: foodCost,
      miscellaneous: miscellaneousCost,
      total: totalCost + accommodationCost + transportationCost + foodCost + miscellaneousCost,
      dailyAverage: (totalCost + accommodationCost + transportationCost + foodCost + miscellaneousCost) / itinerary.length,
      budgetCategory: this.categorizeBudget(totalCost + accommodationCost + transportationCost + foodCost + miscellaneousCost)
    };
  }

  // Helper methods for scoring
  calculateBudgetScore(activityCost, userAverageBudget) {
    if (!userAverageBudget) return 0.5;
    const ratio = activityCost / userAverageBudget;
    if (ratio < 0.3) return 0.8; // Very affordable
    if (ratio < 0.7) return 0.9; // Good value
    if (ratio < 1.2) return 0.7; // Moderate
    return 0.4; // Expensive
  }

  calculateDurationScore(activityDuration, tripDuration) {
    if (!tripDuration) return 0.5;
    const ratio = activityDuration / tripDuration;
    if (ratio < 0.1) return 0.9; // Short activity
    if (ratio < 0.3) return 0.8; // Medium activity
    return 0.6; // Long activity
  }

  calculateSeasonalScore(activity, seasonalPreferences) {
    // Simple seasonal scoring - can be enhanced with weather data
    return 0.7; // Default moderate score
  }

  calculateDiversityScore(activity, selectedActivities) {
    const similarActivities = selectedActivities.filter(a => a.category === activity.category);
    return Math.max(0.1, 1 - (similarActivities.length * 0.2));
  }

  generateRecommendationReason(activity, score, travelHistory) {
    const reasons = [];
    
    if (score > 0.8) reasons.push('Highly recommended based on your preferences');
    if (activity.rating > 4.5) reasons.push('Top-rated by travelers');
    if (activity.cost < 50) reasons.push('Great value for money');
    if (travelHistory.preferredRegions[activity.city.country]) {
      reasons.push('Matches your travel style');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Popular local experience';
  }

  getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  estimateTransportationCost(city, days) {
    // Estimate based on city cost index
    const baseCost = city.costIndex * 0.5;
    return baseCost * days;
  }

  estimateFoodCost(city, days) {
    // Estimate based on city average daily cost
    return city.averageDailyCost * days * 0.4; // 40% of daily cost for food
  }

  categorizeBudget(totalCost) {
    if (totalCost < 1000) return 'budget';
    if (totalCost < 3000) return 'moderate';
    if (totalCost < 7000) return 'luxury';
    return 'premium';
  }

  // Create AI-generated trip description
  generateTripDescription(city, itinerary, budgetAnalysis) {
    const highlights = itinerary
      .flatMap(day => day.activities)
      .slice(0, 3)
      .map(activity => activity.name);

    return `Experience the magic of ${city.name} with this AI-curated ${itinerary.length}-day adventure. 
    Discover ${highlights.join(', ')}, and immerse yourself in the local culture. 
    This ${budgetAnalysis.budgetCategory} trip is perfectly balanced for an unforgettable experience.`;
  }
}

module.exports = new AITripPlanner();
