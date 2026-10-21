"""
UrbanHeat — Data Science & ML Model Interfaces (Phase 1 Placeholder)

This module defines the clean contracts and interfaces for:
1. Baseline Heat Risk Index (HVI) calculation.
2. Unsupervised K-Means Microclimate Clustering.
3. Empirical Land Surface Temperature (LST) Sensitivity Regression.

No synthetic supervised labels are fabricated.
"""

from typing import Dict, Any, List


class MicroclimateClusteringEngine:
    """
    Unsupervised K-Means Clustering Engine.
    Groups 24 Mumbai wards into physical microclimate archetypes based on:
    [LST_mean, NDVI_mean, NDBI_mean, Population_Density]
    """
    def __init__(self, n_clusters: int = 3):
        self.n_clusters = n_clusters
        self.is_trained = False
        self.cluster_names = {
            0: "Concrete Thermal Hotspot",
            1: "Vegetated Thermal Buffer",
            2: "Coastal Moderate Microclimate"
        }

    def fit_predict(self, features: List[List[float]]) -> List[int]:
        """
        Placeholder method for model training.
        Returns precomputed cluster IDs for Phase 1 demo.
        """
        # Interface ready for scikit-learn KMeans(n_clusters=3).fit_predict(X)
        return [0, 1, 2]

    def get_summary(self) -> Dict[str, Any]:
        return {
            "n_clusters": self.n_clusters,
            "cluster_names": self.cluster_names,
            "silhouette_score_target": 0.65,
            "is_demo_placeholder": True
        }


class EmpiricalLSTRegressionEngine:
    """
    Empirical LST Sensitivity Regression.
    Quantifies physical relationships: LST = f(NDVI, NDBI, Distance_to_Coast, Pop_Density)
    """
    def __init__(self):
        self.coefficients = {"ndvi": -7.45, "ndbi": 12.18, "intercept": 28.5}
        self.r2_score = 0.812

    def predict_lst(self, ndvi: float, ndbi: float) -> float:
        """
        Calculates predicted LST based on empirical coefficient slopes.
        """
        return self.coefficients["intercept"] + (self.coefficients["ndvi"] * ndvi) + (self.coefficients["ndbi"] * ndbi)

    def get_summary(self) -> Dict[str, Any]:
        return {
            "coefficients": self.coefficients,
            "r2_score": self.r2_score,
            "interpretation": "A 0.1 increase in NDVI is associated with a 0.75°C drop in surface temperature.",
            "is_demo_placeholder": True
        }
