export const getAnalytics = async (req, res) => {

    const toatlusers = await pool.query("SELECT COUNT(*) FROM users");
    const totalproducts = await pool.query("SELECT COUNT(*) FROM products");

    const revenue = await pool.query("SELECT SUM(total_amount) FROM orders");
    const totalorders = await pool.query("SELECT COUNT(*) FROM orders");

    return {
        totalusers: toatlusers.rows[0].count,
        totalproducts: totalproducts.rows[0].count,
        revenue: revenue.rows[0].sum,
        totalorders: totalorders.rows[0].count
    }
};

export const getDailySalesData = async (startDate, endDate) => {
    const dailySalesQuery = `
        SELECT date_trunc('day', created_at) as day, COUNT(*) as sales, SUM(total_amount) as revenue
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY day
        ORDER BY day;
    `;
    const { rows } = await pool.query(dailySalesQuery, [startDate, endDate]);

    const datearray = getDatesinrange(startDate, endDate);

    return datearray.map(date => {
        const record = rows.find(row => row.day.toDateString() === date.toDateString());
        return {
            date: date,
            sales: record ? record.sales : 0,
            revenue: record ? record.revenue : 0
        };
    }
    );
};

function getDatesinrange(startDate, endDate) {
    const dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}