from flask import Flask, jsonify, request
from neo4j import GraphDatabase

app = Flask(__name__)
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "ahmetbaba1941"))

# Middleware: Neo4j session işlemleri
@app.before_request
def before_request():
    request.neo4j_session = driver.session()

@app.teardown_request
def teardown_request(exception):
    if hasattr(request, 'neo4j_session'):
        request.neo4j_session.close()

# API rotası: Tüm edebi dönemler ve altındaki eserleri, yazarları ve yayınevlerini listeleyin
@app.route('/edebiDonemler', methods=['GET'])
def get_edebi_donemler():
    session = request.neo4j_session
    try:
        result = session.run(
            'MATCH (ed:EdebiDonem)-[:ICERIR]->(eser:Eser)<-[:YAZDI]-(yazar:Yazar)-[:YAYINEVINDEN]->(yayinevi:Yayinevi) RETURN ed.name AS donem, collect({ eser: eser.title, yazar: yazar.name, yayinevi: yayinevi.name }) AS eserler'
        )
        edebi_donemler = [{"donem": record["donem"], "eserler": record["eserler"]} for record in result]
        return jsonify(edebi_donemler)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API rotası: Edebî döneme göre yazarları ve eserlerini listele
@app.route('/edebiDonemler/<donem>/yazarlar', methods=['GET'])
def get_yazarlar_by_donem(donem):
    session = request.neo4j_session
    try:
        result = session.run(
            'MATCH (ed:EdebiDonem {name: $donem})-[:ICERIR]->(eser:Eser)<-[:YAZDI]-(yazar:Yazar) RETURN yazar.name AS yazar, collect(eser.title) AS eserler',
            donem=donem
        )
        yazarlar = [{"yazar": record["yazar"], "eserler": record["eserler"]} for record in result]
        return jsonify(yazarlar)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API rotası: Edebî döneme göre yayınevlerini listele
@app.route('/edebiDonemler/<donem>/yayinevleri', methods=['GET'])
def get_yayinevleri_by_donem(donem):
    session = request.neo4j_session
    try:
        result = session.run(
            'MATCH (ed:EdebiDonem {name: $donem})-[:ICERIR]->(eser:Eser)-[:YAYINEVINDEN]->(yayinevi:Yayinevi) RETURN yayinevi.name AS yayinevi, collect(eser.title) AS eserler',
            donem=donem
        )
        yayinevleri = [{"yayinevi": record["yayinevi"], "eserler": record["eserler"]} for record in result]
        return jsonify(yayinevleri)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API rotası: Eser arama
@app.route('/eserler/<eser_adi>', methods=['GET'])
def get_eser_by_adi(eser_adi):
    session = request.neo4j_session
    try:
        result = session.run(
            'MATCH (eser:Eser {title: $eser_adi})<-[:YAZDI]-(yazar:Yazar)-[:YAYINEVINDEN]->(yayinevi:Yayinevi) RETURN eser.title AS eser, yazar.name AS yazar, yayinevi.name AS yayinevi',
            eser_adi=eser_adi
        )
        eser_detay = [{"eser": record["eser"], "yazar": record["yazar"], "yayinevi": record["yayinevi"]} for record in result]
        return jsonify(eser_detay)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Diğer rotaları da ekleyebilirsiniz...

if __name__ == '__main__':
    app.run(port=5000)
