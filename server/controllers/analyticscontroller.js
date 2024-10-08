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

const getDailySalesData = async (startDate, endDate) => {
    const dailySalesQuery = `
        SELECT date_trunc('day', created_at) as day, SUM(total_amount) as total
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY day
        ORDER BY day;
    `;
    const { rows } = await pool.query(dailySalesQuery, [startDate, endDate]);

    return rows;
};