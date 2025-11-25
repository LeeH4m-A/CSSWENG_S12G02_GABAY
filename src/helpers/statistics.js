import { patientModel } from '../model/model.js';

/**
 * Fetch dashboard statistics and available years in a single query.
 * @returns { statistics, years }
 */
export async function getDashboardStatistics() {
    const stats = await patientModel.aggregate([
        {
            $facet: {
                totalPatientsTested: [{ $count: "count" }],
                biomedicalPatientsTested: [
                    { $match: { data_type: "Biomedical" } },
                    { $count: "count" }
                ],
                nonbiomedicalPatientsTested: [
                    { $match: { data_type: "Nonbiomedical" } },
                    { $count: "count" }
                ],
                positivePatientsTested: [
                    { $match: { data_type: "Biomedical", "biomedical.test_result": "Positive" } },
                    { $count: "count" }
                ],
                negativePatientsTested: [
                    { $match: { data_type: "Biomedical", "biomedical.test_result": "Negative" } },
                    { $count: "count" }
                ],
                dnkPatientsTested: [
                    { $match: { data_type: "Biomedical", "biomedical.test_result": "Do Not Know" } },
                    { $count: "count" }
                ],
                years: [
                    { $project: { year: { $year: "$date_encoded" } } },
                    { $group: { _id: "$year" } },
                    { $sort: { _id: -1 } }
                ]
            }
        }
    ]);

    return {
        statistics: {
            totalPatientsTested: stats[0].totalPatientsTested[0]?.count || 0,
            biomedicalPatientsTested: stats[0].biomedicalPatientsTested[0]?.count || 0,
            nonbiomedicalPatientsTested: stats[0].nonbiomedicalPatientsTested[0]?.count || 0,
            positivePatientsTested: stats[0].positivePatientsTested[0]?.count || 0,
            negativePatientsTested: stats[0].negativePatientsTested[0]?.count || 0,
            dnkPatientsTested: stats[0].dnkPatientsTested[0]?.count || 0
        },
        years: stats[0].years.map(y => y._id)
    };
}
