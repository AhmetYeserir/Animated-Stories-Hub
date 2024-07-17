const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;

app.use(cors());

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'ahmetbaba1941'));

app.use((req, res, next) => {
    req.neo4jSession = driver.session();
    next();
});

// API rotası: Tüm edebi dönemler ve altındaki eserleri, yazarları ve yayınevlerini listeleyin
app.get('/edebiDonemler', async (req, res) => {
    const session = req.neo4jSession;
    try {
        const result = await session.run(
            'MATCH (ed: EdebiDonem)-[:ICERIR]->(eser: Eser)<-[:YAZDI]-(yazar: Yazar)-[:YAYINEVINDEN]->(yayinevi: Yayinevi) RETURN ed.name AS donem, collect({ eser: eser.title, yazar: yazar.name, yayinevi: yayinevi.name }) AS eserler'
        );
        const edebiDonemler = result.records.map(record => ({
            donem: record.get('donem'),
            eserler: record.get('eserler')
        }));
        res.json(edebiDonemler);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// API rotası: Edebî döneme göre yazarları ve eserlerini listele
app.get('/edebiDonemler/:donem/yazarlar', async (req, res) => {
    const session = req.neo4jSession;
    const edebiDonem = req.params.donem;
    try {
        const result = await session.run(
            'MATCH (ed: EdebiDonem {name: $donem})-[:ICERIR]->(eser: Eser)<-[:YAZDI]-(yazar: Yazar) RETURN yazar.name AS yazar, collect(eser.title) AS eserler',
            { donem: edebiDonem }
        );
        const yazarlar = result.records.map(record => ({
            yazar: record.get('yazar'),
            eserler: record.get('eserler')
        }));
        res.json(yazarlar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// API rotası: Edebî döneme göre yayınevlerini listele
app.get('/edebiDonemler/:donem/yayinevleri', async (req, res) => {
    const session = req.neo4jSession;
    const edebiDonem = req.params.donem;
    try {
        const result = await session.run(
            'MATCH (ed: EdebiDonem {name: $donem})-[:ICERIR]->(eser: Eser)-[:YAYINEVINDEN]->(yayinevi: Yayinevi) RETURN yayinevi.name AS yayinevi, collect(eser.title) AS eserler',
            { donem: edebiDonem }
        );
        const yayinevleri = result.records.map(record => ({
            yayinevi: record.get('yayinevi'),
            eserler: record.get('eserler')
        }));
        res.json(yayinevleri);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// API rotası: Eser arama
app.get('/eserler/:eserAdi', async (req, res) => {
    const session = req.neo4jSession;
    const eserAdi = req.params.eserAdi;
    try {
        const result = await session.run(
            'MATCH (eser:Eser {title: $eserAdi})<-[:YAZDI]-(yazar:Yazar)-[:YAYINEVINDEN]->(yayinevi:Yayinevi) RETURN eser.title AS eser, yazar.name AS yazar, yayinevi.name AS yayinevi',
            { eserAdi }
        );
        const eserDetay = result.records.map(record => ({
            eser: record.get('eser'),
            yazar: record.get('yazar'),
            yayinevi: record.get('yayinevi')
        }));
        res.json(eserDetay);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı portta çalışıyor`);
});
