import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StandingsGraphProps {
    groupId: string;
}

const StandingsGraph: React.FC<StandingsGraphProps> = ({ groupId }) => {
    const data = {
        labels: ['Race 1', 'Race 2', 'Race 3', 'Race 4'],
        datasets: [
            {
                label: 'User Standings',
                data: [50, 60, 70, 80],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    return (
        <div className="standings-graph">
            <Line data={data} />
        </div>
    );
};

export default StandingsGraph;
