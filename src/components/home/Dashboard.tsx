import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="p-4 grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-bold mb-2">Эксперименты</h2>
                    <p>Скоро здесь появятся данные об экспериментах...</p>
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-bold mb-2">Пользовательские конфигурации</h2>
                    <p>Скоро здесь появятся данные о конфигурациях...</p>
                </div>
            </div>
            <div className="bg-white shadow rounded p-4">
                <h2 className="text-xl font-bold mb-2">Запущенные задачи</h2>
                <p>Скоро здесь появятся данные о задачах...</p>
            </div>
        </div>
    );
};

export default Dashboard;
