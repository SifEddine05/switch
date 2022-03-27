const express = require('express');
const router = express.Router();
const Port = require('../models/port');
const Switch = require('../models/switch');
const { pickBy, identity } = require('lodash')
const _ = require('lodash')
const { redirect } = require('express/lib/response');


router.get('/switch', async (req, res) => {
    const data = await Switch.find()
    res.send(data)
})

router.get('/ports', (req ,res) => {
    const data = Port.find(req.body)
    res.send(data)
})

router.post('/postport', (req, res) => {
    const p = new Port(req.body)
    p.save()
    res.redirect('/get')
})

router.post('/postswitch', (req, res) => {
    const s = new Switch(req.body)
    s.save()
    res.redirect('/get')
})

router.get('/search', async (req, res) => {
    const dataSwitch = pickBy({
        Nom: req.body.Nom,
        Marque: req.body.Marque,
        Bloc: req.body.Bloc,
        Adresse_MAC: req.body.Adresse_MAC,
        N_d_inventaire: req.body.N_d_inventaire
    },identity)
    const dataPort = pickBy({
        ip_vlan: req.body.ip_vlan,
        prise: req.body.prise
    },identity)
    let resultSwitch = await Switch.find(dataSwitch)
    let resultPort = await Port.find(dataPort)
    let table = resultPort.map((ele) => ele.nom_switch)
    let table2 = resultSwitch.map((ele) => ele.Nom)
    if(Object.keys(dataPort).length && Object.keys(dataSwitch).length){
        let fin = await Switch.find( { Nom: { $in : _.intersection(table,table2) } } )
        console.log(fin);
    } else if (Object.keys(dataPort).length) {
        let fin = await Switch.find( { Nom: { $in : table } } )
        console.log(fin.length);

    } else {
        console.log(resultSwitch.length);
    }
})

router.get('/getbyid', async (req ,res) => {
    console.log(req.body);
    const elem = await Switch.findById(req.body._id)
    const ports = await Port.find({ nom_switch: elem.Nom })
    console.log(elem,ports);
    res.send({
        switch: elem,
        ports: ports
    })
})

router.get('/search/port', async (req ,res) => {
    let data
    if(typeof(req.body.id) ==="string") {
        data = await Port.find({
            $or: [
                {ip_vlan: req.body.id},
                {type: req.body.id},
                {Cascades_vers_depuis: req.body.id},
                {prise: req.body.id},
                {nom_switch: req.body.id}
            ]
        })
    } else {
        data = await Port.find({
            $or: [
                {nm_port: req.body.id}
            ]
        })
    }
    console.log(data);  
})




module.exports = router;