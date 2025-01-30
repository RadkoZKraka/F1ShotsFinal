import React, { useEffect, useState } from 'react';
import './GroupPortfolioCard.less';
import GroupPortfolioService from '../../../Services/GroupPortfolioService';
import { GroupPortfolio } from "../../../Models/GroupPortfolio";

interface GroupPortfolioCardProps {
    groupId: string;
}

const GroupPortfolioCard: React.FC<GroupPortfolioCardProps> = ({ groupId }) => {
    const [groupPortfolio, setGroupPortfolio] = useState<GroupPortfolio>({} as GroupPortfolio);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroupPortfolio = async () => {
            try {
                const data = await GroupPortfolioService.GetGroupPortfolio(groupId);
                setGroupPortfolio(data);
            } catch (error) {
                setError('Failed to fetch group portfolio.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupPortfolio();
    }, [groupId]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="group-portfolio-card">
            <div className="group-info">
                <h2 className="group-name">{groupPortfolio.groupId}</h2>
                <p className="portfolio-meta">
                    <strong>Created on:</strong> {new Date(groupPortfolio.creationDate).toLocaleDateString()}
                    <br />
                    <strong>Last updated:</strong> {new Date(groupPortfolio.lastUpdated).toLocaleDateString()}
                </p>
            </div>

           
        </div>
    );
};

export default GroupPortfolioCard;
